import pandas as pd
import psycopg2
import os

class HomeopathicEngine:
    def __init__(self, db_url=None):
        self.db_url = db_url
        self.use_local = True
        self.conn = None
        
        # Local dataframes for fallback
        self.rubrics = None
        self.remedies = None
        self.mappings = None
        
        if db_url:
            try:
                self.conn = psycopg2.connect(db_url)
                self.use_local = False
                print("Engine successfully connected to live PostgreSQL database!")
            except Exception as e:
                print(f"Failed to connect to database: {e}. Falling back to local CSV mode.")
                self.use_local = True
                
        if self.use_local:
            self._load_local_data()

    def _load_local_data(self):
        print("Loading local CSV files...")
        # Check standard paths
        rubrics_path = '/workspace/artifacts/rubrics_rows.csv'
        remedies_path = '/workspace/knowledge/remedies_rows.csv'
        mappings_path = '/workspace/artifacts/rubric_remedies_rows-v2.csv'
        
        if not os.path.exists(rubrics_path):
            rubrics_path = './rubrics_rows.csv'
        if not os.path.exists(remedies_path):
            remedies_path = './remedies_rows.csv'
        if not os.path.exists(mappings_path):
            mappings_path = './rubric_remedies_rows-v2.csv'
            
        self.rubrics = pd.read_csv(rubrics_path)
        self.remedies = pd.read_csv(remedies_path)
        self.mappings = pd.read_csv(mappings_path)
        
        # Ensure correct datatypes
        self.rubrics['rubric_id'] = self.rubrics['rubric_id'].astype(int)
        self.rubrics['parent_id'] = pd.to_numeric(self.rubrics['parent_id'], errors='coerce')
        self.remedies['remedy_id'] = self.remedies['remedy_id'].astype(int)
        self.mappings['rubric_id'] = self.mappings['rubric_id'].astype(int)
        self.mappings['remedy_id'] = self.mappings['remedy_id'].astype(int)
        self.mappings['grade'] = self.mappings['grade'].astype(int)

    def get_root_rubrics(self):
        """Returns a list of tuples (rubric_id, name) for root chapters (no parent)"""
        if not self.use_local:
            try:
                cursor = self.conn.cursor()
                cursor.execute("SELECT rubric_id, name FROM public.rubrics WHERE parent_id IS NULL ORDER BY name;")
                return cursor.fetchall()
            except Exception as e:
                print(f"DB Error, falling back to local: {e}")
                self.use_local = True
                self._load_local_data()
                
        # Local fallback
        roots = self.rubrics[self.rubrics['parent_id'].isna()]
        return roots[['rubric_id', 'name']].sort_values('name').values.tolist()

    def get_child_rubrics(self, parent_id):
        """Returns a list of tuples (rubric_id, name) for children of parent_id"""
        if not self.use_local:
            try:
                cursor = self.conn.cursor()
                cursor.execute("SELECT rubric_id, name FROM public.rubrics WHERE parent_id = %s ORDER BY name;", (int(parent_id),))
                return cursor.fetchall()
            except Exception as e:
                print(f"DB Error, falling back to local: {e}")
                self.use_local = True
                self._load_local_data()
                
        # Local fallback
        children = self.rubrics[self.rubrics['parent_id'] == float(parent_id)]
        return children[['rubric_id', 'name']].sort_values('name').values.tolist()

    def get_rubric_path(self, rubric_id):
        """Returns the full hierarchical breadcrumb path of a rubric"""
        if not self.use_local:
            try:
                path = []
                curr_id = rubric_id
                cursor = self.conn.cursor()
                while curr_id:
                    cursor.execute("SELECT name, parent_id FROM public.rubrics WHERE rubric_id = %s", (int(curr_id),))
                    row = cursor.fetchone()
                    if not row:
                        break
                    name, parent_id = row
                    path.append(name)
                    curr_id = parent_id
                return " > ".join(reversed(path))
            except Exception as e:
                print(f"DB Error, falling back to local: {e}")
                self.use_local = True
                self._load_local_data()
                
        # Local fallback
        path = []
        curr_id = rubric_id
        while curr_id and not pd.isna(curr_id):
            row = self.rubrics[self.rubrics['rubric_id'] == int(curr_id)]
            if row.empty:
                break
            name = row.iloc[0]['name']
            path.append(name)
            curr_id = row.iloc[0]['parent_id']
        return " > ".join(reversed(path))

    def repertorize(self, rubric_ids, grade_weights):
        """
        Runs homeopathic repertorization on the selected rubric_ids.
        grade_weights: dict like {1: 3, 2: 2, 3: 1}
        Returns a pandas DataFrame of results.
        """
        if not rubric_ids:
            return pd.DataFrame()
            
        if not self.use_local:
            try:
                cursor = self.conn.cursor()
                # Create tuple string for query
                query_ids = tuple(int(x) for x in rubric_ids)
                # To handle single element tuple (1,) vs (1, 2) in SQL:
                if len(query_ids) == 1:
                    sql_in = f"({query_ids[0]})"
                else:
                    sql_in = str(query_ids)
                    
                query = f"""
                    SELECT rr.rubric_id, rr.remedy_id, rr.grade, r.abbreviation, r.full_name, rub.name AS rubric_name
                    FROM public.rubric_remedies rr
                    JOIN public.remedies r ON rr.remedy_id = r.remedy_id
                    JOIN public.rubrics rub ON rr.rubric_id = rub.rubric_id
                    WHERE rr.rubric_id IN {sql_in};
                """
                cursor.execute(query)
                rows = cursor.fetchall()
                df = pd.DataFrame(rows, columns=['rubric_id', 'remedy_id', 'grade', 'abbreviation', 'full_name', 'rubric_name'])
            except Exception as e:
                print(f"DB Error, falling back to local: {e}")
                self.use_local = True
                self._load_local_data()
                
        if self.use_local:
            # Filter mappings
            filtered = self.mappings[self.mappings['rubric_id'].isin(rubric_ids)]
            if filtered.empty:
                return pd.DataFrame()
            # Merge with remedies and rubrics
            df = filtered.merge(self.remedies, on='remedy_id')
            df = df.merge(self.rubrics, on='rubric_id')
            df = df.rename(columns={'name': 'rubric_name'})
            
        # Map grades to weights
        df['weight'] = df['grade'].map(grade_weights).fillna(1.0)
        
        # Calculate full breadcrumbs for each rubric to display in the grid
        rubric_paths = {rid: self.get_rubric_path(rid) for rid in rubric_ids}
        df['rubric_path'] = df['rubric_id'].map(rubric_paths)
        
        # Group by remedy to compile stats
        total_symptoms = len(rubric_ids)
        
        # Build aggregated stats
        results = []
        for remedy_id, group in df.groupby('remedy_id'):
            abbrev = group.iloc[0]['abbreviation']
            full_name = group.iloc[0]['full_name']
            covered_count = len(group)
            coverage_pct = (covered_count / total_symptoms) * 100
            total_score = group['weight'].sum()
            
            # Create a string detailing covered symptoms
            details_list = []
            grid_vals = {}
            for _, row in group.iterrows():
                details_list.append(f"{row['rubric_name']} (g.{int(row['grade'])})")
                grid_vals[row['rubric_id']] = int(row['grade'])
                
            details_str = ", ".join(details_list)
            
            results.append({
                'remedy_id': remedy_id,
                'abbreviation': abbrev,
                'full_name': full_name,
                'coverage': f"{covered_count}/{total_symptoms}",
                'coverage_count': covered_count,
                'coverage_pct': coverage_pct,
                'total_score': total_score,
                'details': details_str,
                'grid_vals': grid_vals
            })
            
        res_df = pd.DataFrame(results)
        if not res_df.empty:
            # Sort: primary coverage count (DESC), secondary total score (DESC)
            res_df = res_df.sort_values(by=['coverage_count', 'total_score'], ascending=[False, False])
            res_df = res_df.reset_index(drop=True)
            
        return res_df

# Quick local test
if __name__ == "__main__":
    engine = HomeopathicEngine()
    print("Roots found:", engine.get_root_rubrics())
    print("Children of MIND (1):", engine.get_child_rubrics(1)[:5])
    print("Rubric path of morning (3):", engine.get_rubric_path(3))
    
    # Test repertorization
    weights = {1: 3, 2: 2, 3: 1} # Grade 1 = 3pts, Grade 2 = 2pts, Grade 3 = 1pt
    res = engine.repertorize([3, 7], weights)
    print("Top results:")
    print(res.head(5)[['abbreviation', 'full_name', 'coverage', 'total_score']])
