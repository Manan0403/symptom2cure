import os
import re
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from engine import HomeopathicEngine

app = FastAPI(
    title="Kent Repertory Clinical API",
    description="Backend API for Kent Repertory Ingestion & Clinical Repertorization",
    version="2.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine
default_db_url = os.environ.get("SUPABASE_DB_URL", "")
engine = None

def get_engine(use_live: bool = False, db_url: Optional[str] = None):
    global engine
    url = db_url or default_db_url
    if use_live and url:
        engine = HomeopathicEngine(db_url=url)
    else:
        engine = HomeopathicEngine(db_url=None)
    _rebuild_rubric_cache()
    return engine

# In-memory fast rubric search cache
rubric_cache: Dict[int, dict] = {}
all_paths_cache: Dict[int, str] = {}

def _rebuild_rubric_cache():
    global rubric_cache, all_paths_cache
    rubric_cache.clear()
    all_paths_cache.clear()
    
    if engine.use_local and engine.rubrics is not None:
        for _, row in engine.rubrics.iterrows():
            rid = int(row['rubric_id'])
            pid = None if pd.isna(row['parent_id']) else int(row['parent_id'])
            rubric_cache[rid] = {
                'rubric_id': rid,
                'parent_id': pid,
                'name': str(row['name'])
            }
    else:
        try:
            cur = engine.conn.cursor()
            cur.execute("SELECT rubric_id, parent_id, name FROM public.rubrics;")
            rows = cur.fetchall()
            for r in rows:
                rid = int(r[0])
                pid = int(r[1]) if r[1] is not None else None
                rubric_cache[rid] = {
                    'rubric_id': rid,
                    'parent_id': pid,
                    'name': str(r[2])
                }
        except Exception as e:
            print(f"Error caching DB rubrics: {e}")
            if engine.rubrics is not None:
                for _, row in engine.rubrics.iterrows():
                    rid = int(row['rubric_id'])
                    pid = None if pd.isna(row['parent_id']) else int(row['parent_id'])
                    rubric_cache[rid] = {
                        'rubric_id': rid,
                        'parent_id': pid,
                        'name': str(row['name'])
                    }

    # Pre-build path strings for instant lookup
    for rid in rubric_cache:
        path_parts = []
        curr = rid
        visited = set()
        while curr and curr not in visited and curr in rubric_cache:
            visited.add(curr)
            path_parts.append(rubric_cache[curr]['name'])
            curr = rubric_cache[curr]['parent_id']
        all_paths_cache[rid] = " > ".join(reversed(path_parts))

# Initialize on startup
get_engine(use_live=False)

# Rich Materia Medica Dictionary for prominent homeopathic remedies
MATERIA_MEDICA_ARCHIVE = {
    "Acon.": {
        "common_name": "Monkshood / Wolfsbane",
        "kingdom": "Plant (Ranunculaceae)",
        "thermal": "Chilly, worse cold dry winds",
        "keynotes": "Sudden, violent, storm-like onset of complaints. Intense acute fever with dry, hot skin and relentless thirst. Extreme restlessness with intense, agonized fear of death, often predicting the very day and hour. Great agitation of mind and body.",
        "modalities": "Worse: Cold, dry wind, evening and night, lying on affected side, tobacco smoke. Better: Open air, rest, perspiration.",
        "clinical_indications": "Acute inflammatory fevers, early stage colds, panic attacks, shock from trauma, croup, sudden palpitations."
    },
    "Bell.": {
        "common_name": "Deadly Nightshade",
        "kingdom": "Plant (Solanaceae)",
        "thermal": "Hot head, cold extremities",
        "keynotes": "Suddenness, redness, burning heat, and fierce throbbing pulsations. Carotids throb violently. Flushed scarlet face, wildly dilated pupils, eyes glistening with fever. Delirium with wild hallucinations (sees ghosts, black dogs). No thirst despite dry mouth.",
        "modalities": "Worse: Touch, jar, light, noise, motion, afternoon (3 PM), lying down. Better: Semi-erect posture, bending backward, resting in a quiet dark room.",
        "clinical_indications": "High fever with delirium, congestive throbbing headaches, acute tonsillitis, otitis media, scarlet rash, sunstroke."
    },
    "Sulph.": {
        "common_name": "Sublimed Sulphur / Brimstone",
        "kingdom": "Mineral (Element)",
        "thermal": "Extremely warm-blooded / Hot",
        "keynotes": "The great centrifugal remedy. Burning sensations everywhere: vertex, palms, soles (must stick feet out of bed covers at night). Ravenous hunger at 11 AM with empty sinking feeling in stomach. Aversion to bathing and washing; skin eruptions itch violently, worse from warmth of bed.",
        "modalities": "Worse: Warmth of bed, washing/bathing, standing, 11 AM, milk. Better: Dry warm weather, lying on right side, motion.",
        "clinical_indications": "Chronic skin disorders (eczema, psoriasis), relapse after acute illness, morning diarrhea, sluggish digestion, psoric diathesis."
    },
    "Nux-v.": {
        "common_name": "Poison Nut",
        "kingdom": "Plant (Loganiaceae)",
        "thermal": "Extremely chilly, sensitive to drafts",
        "keynotes": "Modern high-stress sedentary polycrest. Hyper-sensitive, irritable, impatient, competitive workaholic. Overindulgence in stimulants (coffee, alcohol, rich food, medicines). Constant ineffectual urge to stool and urinate. Dyspepsia with sour belching.",
        "modalities": "Worse: Morning on waking, cold air, dry cold weather, mental exertion, stimulants. Better: Warmth, quiet evening, uninterrupted short nap.",
        "clinical_indications": "Gastritis, irritable bowel, hangover, insomnia waking at 3-4 AM brooding over business, toxic liver congestion."
    },
    "Puls.": {
        "common_name": "Windflower / Pasque Flower",
        "kingdom": "Plant (Ranunculaceae)",
        "thermal": "Warm-blooded, craves cool open air",
        "keynotes": "Gentle, mild, yielding disposition; weeps easily while narrating symptoms, craves sympathy and consolation. Symptoms constantly shifting and wandering from joint to joint. Thick, bland, yellowish-green discharges. Complete thirstlessness with dry mouth.",
        "modalities": "Worse: Warm closed room, rich fatty food, evening, warm applications. Better: Cool open fresh air, gentle walking, consolation, cold food/drinks.",
        "clinical_indications": "Otitis media, sinusitis with thick yellow discharge, delayed/irregular menses, digestive upset from fatty pastries, measles."
    },
    "Ars.": {
        "common_name": "White Oxide of Arsenic",
        "kingdom": "Mineral (Compound)",
        "thermal": "Extremely chilly, craves intense heat",
        "keynotes": "Profound physical exhaustion out of proportion to illness. Extreme mental restlessness—drives from chair to bed. Midnight aggravation (12-2 AM). Intense burning pains relieved remarkably by hot applications and hot drinks. Great thirst for tiny, frequent sips of water. Fastidious, meticulous perfectionist.",
        "modalities": "Worse: Midnight to 2 AM, cold air, cold drinks/food, right side. Better: Heat in every form, hot drinks, head elevated.",
        "clinical_indications": "Food poisoning, acute gastroenteritis, asthmatic attacks at 1 AM, burning eczema, debilitating chronic fatigue, anxiety."
    },
    "Bry.": {
        "common_name": "White Bryony",
        "kingdom": "Plant (Cucurbitaceae)",
        "thermal": "Warm, worse from warmth",
        "keynotes": "Aggravation from the absolute slightest movement. Stitching, tearing pains. Intense dryness of all mucous membranes: dry cracked lips, hard dry stool as if burnt. Unquenchable thirst for large quantities of cold water at long intervals. Desires to lie perfectly still on the painful side.",
        "modalities": "Worse: Any motion, exertion, morning, warmth, coughing. Better: Absolute rest, firm pressure, lying on painful side, cold things.",
        "clinical_indications": "Pleurisy, dry painful cough, acute rheumatism, acute appendicitis early stage, frontal bursting headaches."
    },
    "Lach.": {
        "common_name": "Bushmaster Snake Venom",
        "kingdom": "Animal (Reptile Venom)",
        "thermal": "Warm-blooded, hot flushes",
        "keynotes": "Left-sided affections, spreading left to right. Extreme intolerance of any constriction or tight clothing around neck and waist. Suspicious, intensely jealous, loquacious—jumps rapidly from one subject to another. Worse after sleep; sleeps into aggravation. All symptoms dramatically relieved when discharges appear.",
        "modalities": "Worse: After sleep, morning, touch, tight collars, heat, alcohol. Better: Appearance of physiological discharges, cool air, eating.",
        "clinical_indications": "Menopausal hot flashes, septic sore throat, purplish ulcerations, varicose veins, cardiac angina, migraine."
    }
}

class RepertorizeRequest(BaseModel):
    rubric_ids: List[int]
    weights: Optional[Dict[str, float]] = None

class ModeRequest(BaseModel):
    mode: str # "local" or "live"
    db_url: Optional[str] = None

@app.get("/api/status")
def get_status():
    total_rubrics = len(rubric_cache)
    total_remedies = len(engine.remedies) if engine.remedies is not None else 0
    total_mappings = len(engine.mappings) if engine.mappings is not None else 0
    
    return {
        "mode": "local" if engine.use_local else "live",
        "mode_label": "Offline Local Archive (Hearing & Mind Backup)" if engine.use_local else "Live Supabase PostgreSQL Database",
        "total_rubrics": total_rubrics,
        "total_remedies": total_remedies,
        "total_mappings": total_mappings,
        "connected": True
    }

@app.post("/api/mode")
def set_mode(req: ModeRequest):
    use_live = (req.mode == "live")
    get_engine(use_live=use_live, db_url=req.db_url)
    return get_status()

@app.get("/api/chapters")
def get_chapters():
    """Returns top-level chapters (parent_id IS NULL)"""
    roots = []
    for rid, item in rubric_cache.items():
        if item['parent_id'] is None:
            roots.append({"rubric_id": rid, "name": item['name']})
    roots.sort(key=lambda x: x['name'])
    return roots

@app.get("/api/rubrics/children/{parent_id}")
def get_children(parent_id: int):
    """Returns immediate child rubrics of parent_id"""
    children = []
    for rid, item in rubric_cache.items():
        if item['parent_id'] == parent_id:
            children.append({
                "rubric_id": rid,
                "name": item['name'],
                "path": all_paths_cache.get(rid, item['name']),
                "has_children": any(c['parent_id'] == rid for c in rubric_cache.values())
            })
    children.sort(key=lambda x: x['name'])
    return children

@app.get("/api/rubrics/search")
def search_rubrics(q: str = Query(..., min_length=1), limit: int = 50):
    """Fast fuzzy/token search across all rubrics with full paths"""
    query = q.strip().lower()
    tokens = query.split()
    
    matches = []
    for rid, item in rubric_cache.items():
        path = all_paths_cache.get(rid, item['name'])
        path_lower = path.lower()
        name_lower = item['name'].lower()
        
        # Check if all tokens match either name or path
        if all(token in path_lower for token in tokens):
            score = 0
            if name_lower == query:
                score = 100
            elif name_lower.startswith(query):
                score = 80
            elif query in name_lower:
                score = 60
            else:
                score = 40
                
            matches.append({
                "rubric_id": rid,
                "name": item['name'],
                "path": path,
                "parent_id": item['parent_id'],
                "score": score
            })
            
    matches.sort(key=lambda x: (-x['score'], len(x['path']), x['name']))
    return matches[:limit]

@app.get("/api/rubrics/{rubric_id}")
def get_rubric(rubric_id: int):
    if rubric_id not in rubric_cache:
        raise HTTPException(status_code=404, detail="Rubric not found")
    item = rubric_cache[rubric_id]
    return {
        "rubric_id": rubric_id,
        "name": item['name'],
        "parent_id": item['parent_id'],
        "path": all_paths_cache.get(rubric_id, item['name'])
    }

@app.post("/api/repertorize")
def repertorize(req: RepertorizeRequest):
    if not req.rubric_ids:
        return {"remedies": [], "rubrics": []}
    
    # Translate grade weights. Database grade: 1 = Strongest (3pts), 2 = Medium (2pts), 3 = Standard (1pt)
    weights_dict = {1: 3.0, 2: 2.0, 3: 1.0}
    if req.weights:
        for k, v in req.weights.items():
            try:
                weights_dict[int(k)] = float(v)
            except ValueError:
                pass
                
    df = engine.repertorize(req.rubric_ids, weights_dict)
    
    # Selected rubrics detailed metadata
    selected_rubrics_meta = []
    for rid in req.rubric_ids:
        if rid in rubric_cache:
            selected_rubrics_meta.append({
                "rubric_id": rid,
                "name": rubric_cache[rid]['name'],
                "path": all_paths_cache.get(rid, rubric_cache[rid]['name'])
            })
            
    if df.empty:
        return {"remedies": [], "rubrics": selected_rubrics_meta}
        
    remedies_list = []
    for _, row in df.iterrows():
        abbrev = row['abbreviation']
        materia = MATERIA_MEDICA_ARCHIVE.get(abbrev, None)
        
        remedies_list.append({
            "remedy_id": int(row['remedy_id']),
            "abbreviation": abbrev,
            "full_name": str(row['full_name']),
            "coverage": str(row['coverage']),
            "coverage_count": int(row['coverage_count']),
            "coverage_pct": float(row['coverage_pct']),
            "total_score": float(row['total_score']),
            "details": str(row['details']),
            "grid_vals": row['grid_vals'],
            "has_materia_medica": materia is not None,
            "materia_summary": materia['keynotes'] if materia else None,
            "common_name": materia['common_name'] if materia else None,
            "kingdom": materia['kingdom'] if materia else None
        })
        
    return {
        "remedies": remedies_list,
        "rubrics": selected_rubrics_meta,
        "total_selected": len(req.rubric_ids),
        "weights_used": weights_dict
    }

@app.get("/api/remedies/{remedy_id}")
def get_remedy(remedy_id: int):
    # Lookup in remedies df
    if engine.remedies is not None:
        row = engine.remedies[engine.remedies['remedy_id'] == remedy_id]
        if row.empty:
            raise HTTPException(status_code=404, detail="Remedy not found")
        abbrev = row.iloc[0]['abbreviation']
        full_name = row.iloc[0]['full_name']
    else:
        abbrev = "Unknown"
        full_name = "Unknown"
        
    materia = MATERIA_MEDICA_ARCHIVE.get(abbrev, {
        "common_name": "Botanical / Mineral Preparation",
        "kingdom": "Materia Medica Classical Source",
        "thermal": "Determined by individual constitutional symptomatology",
        "keynotes": f"Classical clinical indications for {full_name} ({abbrev}) documented in Kent's Repertory and Boericke Materia Medica.",
        "modalities": "Clinical modalities vary by potency and constitutional temperament.",
        "clinical_indications": "Repertorized based on active symptom totality."
    })
    
    return {
        "remedy_id": remedy_id,
        "abbreviation": abbrev,
        "full_name": full_name,
        **materia
    }

# Mount static build files for complete production serving
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)

