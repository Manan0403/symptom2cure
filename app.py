import streamlit as st
import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
from engine import HomeopathicEngine

# Set Page Configuration
st.set_page_config(
    page_title="Kent Repertory Ingestion & Repertorization Portal",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for the App
st.markdown("""
    <style>
    .main-title {
        font-size: 38px;
        font-weight: 800;
        color: #1E3A8A;
        margin-bottom: 5px;
    }
    .subtitle {
        font-size: 16px;
        color: #4B5563;
        margin-bottom: 25px;
    }
    .section-header {
        font-size: 24px;
        font-weight: 700;
        color: #1E3A8A;
        border-bottom: 2px solid #E5E7EB;
        padding-bottom: 8px;
        margin-top: 20px;
        margin-bottom: 15px;
    }
    .basket-item {
        background-color: #F3F4F6;
        padding: 10px 15px;
        border-radius: 8px;
        border-left: 5px solid #3B82F6;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .grade-badge-3 {
        background-color: #FEE2E2;
        color: #EF4444;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
    .grade-badge-2 {
        background-color: #DBEAFE;
        color: #2563EB;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
    .grade-badge-1 {
        background-color: #F3F4F6;
        color: #4B5563;
        padding: 2px 8px;
        border-radius: 4px;
    }
    </style>
""", unsafe_allow_html=True)

# App Header
st.markdown("<div class='main-title'>🧬 Kent Repertory Ingestion & Repertorization</div>", unsafe_allow_html=True)
st.markdown("<div class='subtitle'>Analyze, map, and repertorize homeopathic chapters using Supabase PostgreSQL or local backup datasets.</div>", unsafe_allow_html=True)

# -------------------------------------------------------------
# SIDEBAR: Connection Settings & Configurations
# -------------------------------------------------------------
st.sidebar.image("https://img.icons8.com/fluency/96/database-administrator.png", width=80)
st.sidebar.markdown("### 🖥️ Connection Settings")

# Database URL input (Prefilled with default or env variable)
default_db_url = os.environ.get("SUPABASE_DB_URL", "")
db_url_input = st.sidebar.text_input(
    "Supabase PostgreSQL URL:",
    value=default_db_url,
    type="password",
    help="Format: postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require"
)

# Mode Selector
st.sidebar.markdown("### 📂 Execution Mode")
mode = st.sidebar.radio(
    "Select Source Data Engine:",
    ["Local Offline Mode (Hearing Backup)", "Live Supabase Database"],
    help="Offline Mode loads pre-generated local CSV files instantly. Live Mode connects to your active Supabase database."
)

# Custom Repertory Weights
st.sidebar.markdown("### ⚖️ Grade Score Weights")
st.sidebar.info("Assign custom weight scores for each grade to influence the ranking algorithm.")

# Dynamic Weight Selection (Matches swapped database grades)
weight_g1 = st.sidebar.slider("Grade 1 (Bold/Red - Strongest) Weight:", 1, 10, 3)
weight_g2 = st.sidebar.slider("Grade 2 (Italics/Blue - Medium) Weight:", 1, 10, 2)
weight_g3 = st.sidebar.slider("Grade 3 (Plain Text - Standard) Weight:", 1, 10, 1)

weights_dict = {
    1: weight_g1,
    2: weight_g2,
    3: weight_g3
}

# -------------------------------------------------------------
# INITIALIZE THE ENGINE
# -------------------------------------------------------------
@st.cache_resource(show_spinner=True)
def init_engine(db_url, execution_mode):
    if execution_mode == "Live Supabase Database" and db_url:
        return HomeopathicEngine(db_url)
    return HomeopathicEngine(db_url=None)

engine = init_engine(db_url_input, mode)

if engine.use_local:
    st.sidebar.success("✅ Running in Local Offline Mode")
else:
    st.sidebar.success("⚡ Connected to Live Supabase Database")

# -------------------------------------------------------------
# SESSION STATE: Symptom Basket Management
# -------------------------------------------------------------
if 'selected_rubrics' not in st.session_state:
    st.session_state.selected_rubrics = [] # List of rubric_id ints

# Helper to add symptom
def add_symptom(rubric_id):
    if rubric_id not in st.session_state.selected_rubrics:
        st.session_state.selected_rubrics.append(rubric_id)
        st.success(f"Added symptom: {engine.get_rubric_path(rubric_id)}")
    else:
        st.warning("This symptom is already in your basket!")

# Helper to remove symptom
def remove_symptom(rubric_id):
    st.session_state.selected_rubrics.remove(rubric_id)

# Helper to clear basket
def clear_basket():
    st.session_state.selected_rubrics = []

# -------------------------------------------------------------
# MAIN LAYOUT: Split into Left Selection Pane and Right Basket/Results Pane
# -------------------------------------------------------------
col_left, col_right = st.columns([1, 1])

# -------------------------------------------------------------
# LEFT COLUMN: Symptom Hierarchy Selector
# -------------------------------------------------------------
with col_left:
    st.markdown("<div class='section-header'>🔍 Hierarchical Symptom Explorer</div>", unsafe_allow_html=True)
    st.write("Drill down into the chapters and nested rubrics of Kent's Repertory to select symptoms.")
    
    # 1. Root Chapter Dropdown
    roots = engine.get_root_rubrics()
    if roots:
        root_names = [r[1] for r in roots]
        selected_root_name = st.selectbox("Select Chapter (Level 0):", root_names)
        selected_root_id = [r[0] for r in roots if r[1] == selected_root_name][0]
        
        # Keep track of active path
        current_parent_id = selected_root_id
        selected_rubric_id = selected_root_id
        
        # 2. Dynamic Nested Sub-rubrics Drill Down
        level = 1
        active_drilldown = True
        
        while active_drilldown:
            children = engine.get_child_rubrics(current_parent_id)
            if not children:
                st.info(f"💡 No further sub-rubrics under this level.")
                break
                
            # Create dropdown with an option to stop and select the current parent rubric
            options = ["[Stop at current level]"] + [c[1] for c in children]
            selected_child_name = st.selectbox(
                f"Sub-rubric (Level {level}):",
                options,
                key=f"drill_L{level}_{current_parent_id}"
            )
            
            if selected_child_name == "[Stop at current level]":
                break
                
            # Update parent and selected rubric
            child_id = [c[0] for c in children if c[1] == selected_child_name][0]
            selected_rubric_id = child_id
            current_parent_id = child_id
            level += 1
            
        # Display Selected Rubric Path
        full_path = engine.get_rubric_path(selected_rubric_id)
        st.markdown(f"**Current Selected Path:** `{full_path}`")
        
        # Add to Basket Button
        if st.button("📥 Add Selected Rubric to Basket", use_container_width=True):
            add_symptom(selected_rubric_id)
    else:
        st.error("No rubrics found. Please verify your database connection or offline CSV backups.")

# -------------------------------------------------------------
# RIGHT COLUMN: Symptom Basket Management
# -------------------------------------------------------------
with col_right:
    st.markdown("<div class='section-header'>🛒 Your Symptom Basket</div>", unsafe_allow_html=True)
    
    if st.session_state.selected_rubrics:
        st.write(f"You have selected **{len(st.session_state.selected_rubrics)}** symptoms for analysis:")
        
        # Display each symptom inside a beautiful card with a remove button
        for rid in list(st.session_state.selected_rubrics):
            path_str = engine.get_rubric_path(rid)
            
            # Row layout for symptom item and delete button
            item_col, del_col = st.columns([8, 2])
            with item_col:
                st.markdown(f"🏷️ **`{path_str}`**", unsafe_allow_html=True)
            with del_col:
                if st.button("❌ Remove", key=f"del_{rid}", use_container_width=True):
                    remove_symptom(rid)
                    st.rerun()
                    
        # Action Buttons
        act_col1, act_col2 = st.columns(2)
        with act_col1:
            if st.button("🗑️ Clear Basket", use_container_width=True):
                clear_basket()
                st.rerun()
        with act_col2:
            suggest_pressed = st.button("🚀 Suggest Remedies", type="primary", use_container_width=True)
    else:
        st.warning("Your basket is empty. Select a chapter and sub-rubric on the left and click 'Add Selected Rubric to Basket'.")
        suggest_pressed = False

# -------------------------------------------------------------
# DETAILED REPERTORIZATION RESULTS SECTION
# -------------------------------------------------------------
if st.session_state.selected_rubrics and (suggest_pressed or 'repertorize_results' in st.session_state):
    st.markdown("<div class='section-header'>📊 Homeopathic Suggestions & Repertorization Results</div>", unsafe_allow_html=True)
    
    # Run repertorization calculation
    with st.spinner("Calculating homeopathic coverage and ranking..."):
        res_df = engine.repertorize(st.session_state.selected_rubrics, weights_dict)
        st.session_state.repertorize_results = res_df
        
    if not res_df.empty:
        # Layout results page
        tab_suggestions, tab_grid, tab_viz = st.tabs(["📋 Suggestion Report", "🔲 Repertory Grid (Matrix)", "📈 Visualization Charts"])
        
        # --- TAB 1: SUGGESTION REPORT ---
        with tab_suggestions:
            st.markdown("### 🔍 Suggested Remedies")
            st.write("Remedies are ranked primary by **Symptom Coverage** (how many selected symptoms the remedy covers) and secondarily by **Total Score** (sum of grade weights).")
            
            # Filters
            col_filt1, col_filt2 = st.columns(2)
            with col_filt1:
                min_cov = st.number_input(
                    "Minimum Symptoms Covered:",
                    min_value=1,
                    max_value=len(st.session_state.selected_rubrics),
                    value=1
                )
            with col_filt2:
                search_rem = st.text_input("Filter by Remedy Name or Abbreviation:")
                
            # Apply filters
            filtered_df = res_df[res_df['coverage_count'] >= min_cov]
            if search_rem:
                filtered_df = filtered_df[
                    filtered_df['abbreviation'].str.contains(search_rem, case=False) |
                    filtered_df['full_name'].str.contains(search_rem, case=False)
                ]
                
            if not filtered_df.empty:
                # Display clean DataFrame
                display_cols = ['abbreviation', 'full_name', 'coverage', 'total_score', 'details']
                st.dataframe(
                    filtered_df[display_cols].rename(columns={
                        'abbreviation': 'Remedy Abbreviation',
                        'full_name': 'Full Scientific Name',
                        'coverage': 'Symptom Coverage',
                        'total_score': 'Weighted Intensity Score',
                        'details': 'Covered Rubrics & Grades'
                    }),
                    use_container_width=True,
                    hide_index=True
                )
                
                # CSV Export
                csv_data = filtered_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="📥 Download Repertorization Report (CSV)",
                    data=csv_data,
                    file_name="kent_repertorization_report.csv",
                    mime="text/csv",
                )
            else:
                st.warning("No remedies matched the filter criteria.")
                
        # --- TAB 2: REPERTORY GRID (MATRIX) ---
        with tab_grid:
            st.markdown("### 🔲 Repertory Grid View")
            st.write("A professional medical-grade grid matrix comparing remedies side-by-side across all selected symptoms.")
            
            # Construct Grid Dataframe
            grid_rows = []
            rubric_paths = {rid: engine.get_rubric_path(rid) for rid in st.session_state.selected_rubrics}
            
            for idx, row in res_df.iterrows():
                grid_row = {
                    'Remedy': f"{row['abbreviation']} ({row['full_name']})",
                    'Coverage': row['coverage'],
                    'Total Score': row['total_score']
                }
                for rid in st.session_state.selected_rubrics:
                    path = rubric_paths[rid]
                    grade = row['grid_vals'].get(rid, None)
                    
                    # Grade notation translation
                    if grade == 1:
                        grid_row[path] = "🔴 Grade 1 (Bold/Red)"
                    elif grade == 2:
                        grid_row[path] = "🔵 Grade 2 (Italic)"
                    elif grade == 3:
                        grid_row[path] = "⚫ Grade 3 (Plain)"
                    else:
                        grid_row[path] = "—"
                        
                grid_rows.append(grid_row)
                
            grid_matrix_df = pd.DataFrame(grid_rows)
            st.dataframe(grid_matrix_df, use_container_width=True, hide_index=True)
            
            # Grade Explainer Legend
            st.markdown("""
                💡 **Grade Legend Explanation (Swapped Schema Mapping):**
                *   🔴 **Grade 1 (Bold/Red)**: Assigned **highest weight score** (Default: `{0}`). Represents a primary, high-intensity clinical symptom-remedy link.
                *   🔵 **Grade 2 (Italics/Blue)**: Assigned **medium weight score** (Default: `{1}`). Represents a verified, medium-intensity link.
                *   ⚫ **Grade 3 (Plain Text)**: Assigned **standard weight score** (Default: `{2}`). Represents standard remedy-symptom relation.
            """.format(weight_g1, weight_g2, weight_g3))
            
        # --- TAB 3: VISUALIZATION CHARTS ---
        with tab_viz:
            st.markdown("### 📈 Top Remedies Visualization")
            st.write("Bar chart representing the top 15 homeopathic remedies matching your active symptom profile.")
            
            # Generate Chart
            top_15 = res_df.head(15)
            
            fig, ax1 = plt.subplots(figsize=(10, 5))
            
            # Plot Scores as bars
            color = 'tab:blue'
            ax1.set_xlabel('Remedy')
            ax1.set_ylabel('Total Weight Score', color=color)
            bars = ax1.bar(top_15['abbreviation'], top_15['total_score'], color=color, alpha=0.6, label='Weighted Score')
            ax1.tick_params(axis='y', labelcolor=color)
            plt.xticks(rotation=45, ha='right')
            
            # Duplicate axis for coverage
            ax2 = ax1.twinx()
            color = 'tab:red'
            ax2.set_ylabel('Coverage Count', color=color)
            line = ax2.plot(top_15['abbreviation'], top_15['coverage_count'], color=color, marker='o', linewidth=2, label='Symptoms Covered')
            ax2.tick_params(axis='y', labelcolor=color)
            
            # Layout adjustment
            fig.tight_layout()
            st.pyplot(fig)
            
    else:
        st.warning("No remedies map to the selected symptoms in the database. Try selecting different or broader rubrics.")
