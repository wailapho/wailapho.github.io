import streamlit as st
import requests
from datetime import datetime, timedelta
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
import google.generativeai as genai
from google.auth.exceptions import RefreshError

st.set_page_config(page_title="Social Media Tracker", page_icon="📊", layout="centered")

# ===================== SIDEBAR =====================
st.sidebar.title("📊 Social Media Tracker")
st.sidebar.markdown("### Make.com Webhooks (AI offloaded)")
perf_webhook = st.sidebar.text_input(
    "Make.com Performance Webhook URL",
    value="https://hook.eu2.make.com/bi98gduy0wkripc5pwagnnmdfabf28on",
    help="Your Make.com webhook that handles performance screenshots + Gemini analysis"
)
leads_webhook = st.sidebar.text_input(
    "Make.com Leads Webhook URL (optional)",
    value="https://hook.eu2.make.com/bi98gduy0wkripc5pwagnnmdfabf28on",
    help="Can be the same webhook (Make router will branch by 'type')"
)

st.sidebar.markdown("### Google Sheet")
sheet_url = st.sidebar.text_input(
    "Master Tracker Google Sheet URL",
    placeholder="https://docs.google.com/spreadsheets/d/..."
)

st.sidebar.markdown("### Report Generation (Optional)")
gemini_key = st.sidebar.text_input("Gemini API Key (for smart reports)", type="password", help="Get free from Google AI Studio")

# ===================== MAIN APP =====================
st.title("Social Media Tracker")
st.markdown("**Upload screenshot → Make.com handles AI + Google Sheets** (no API keys in app for analysis)")

channel = st.selectbox(
    "Select Channel",
    ["Little Red Note (Xiaohongshu)", "Instagram", "Douyin", "Facebook", "TikTok", "Other"]
)

mode = st.radio("What are you tracking?", ["📈 Social Media Post Performance", "👤 Leads from the Channel"], horizontal=True)

uploaded_file = st.file_uploader(
    "Upload Screenshot (jpg/png, max 5MB)",
    type=["jpg", "png", "jpeg"],
    help="Post stats screenshot or chat/lead screenshot"
)

if mode == "📈 Social Media Post Performance":
    st.subheader("Post Performance")
    st.info("Screenshot will be sent to Make.com → Gemini 1.5 will extract metrics → auto-added to your sheet.")

    if st.button("🚀 Send to Make.com for Analysis", type="primary", use_container_width=True):
        if not uploaded_file:
            st.error("Please upload a screenshot")
        elif not perf_webhook:
            st.error("Enter Performance Webhook URL in sidebar")
        else:
            with st.spinner("Sending to Make.com... (Gemini is analysing)"):
                try:
                    files = {'screenshot': (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                    data = {
                        'type': 'performance',
                        'channel': channel,
                        'timestamp': datetime.now().isoformat()
                    }
                    resp = requests.post(perf_webhook, files=files, data=data, timeout=40)
                    if resp.status_code in [200, 202]:
                        st.success("✅ Sent successfully! Check your Google Sheet in a few seconds.")
                        st.balloons()
                    else:
                        st.error(f"Webhook error {resp.status_code}")
                except Exception as e:
                    st.error(f"Error: {e}")

else:  # Leads mode
    st.subheader("New Lead")
    comm_options = ["WeChat", "WhatsApp", "Douyin DM", "Instagram DM", "Facebook Messenger", "Email", "Phone", "Other"]
    comm_channel = st.selectbox("Communication Channel", comm_options)
    if comm_channel == "Other":
        comm_channel = st.text_input("Custom channel")

    notes = st.text_area("Notes", placeholder="Budget, timeline, what they said...")

    if st.button("💾 Save Lead to Sheet", type="primary", use_container_width=True):
        webhook = leads_webhook if leads_webhook else perf_webhook
        if not webhook:
            st.error("Please add at least one webhook URL")
        else:
            with st.spinner("Saving lead..."):
                try:
                    files = {'screenshot': (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)} if uploaded_file else None
                    data = {
                        'type': 'leads',
                        'channel': channel,
                        'comm_channel': comm_channel,
                        'notes': notes or "",
                        'timestamp': datetime.now().isoformat(),
                        'is_lead': 'TRUE'
                    }
                    resp = requests.post(webhook, files=files, data=data, timeout=30)
                    if resp.status_code in [200, 202]:
                        st.success("✅ Lead saved! Check your Google Sheet.")
                    else:
                        st.warning(f"Status: {resp.status_code}")
                except Exception as e:
                    st.error(f"Error: {e}")

# ===================== REPORT =====================
st.divider()
st.subheader("📊 30-Day Report")

if st.button("Generate Report", use_container_width=True):
    if not sheet_url:
        st.error("Paste your Google Sheet URL in the sidebar")
    else:
        with st.spinner("Reading sheet + generating report..."):
            try:
                # gspread setup (uses Streamlit secrets)
                if "gcp_service_account" not in st.secrets:
                    st.error("Service account not in secrets.toml / Streamlit secrets. See setup guide.")
                    st.stop()

                scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
                creds = Credentials.from_service_account_info(st.secrets["gcp_service_account"], scopes=scopes)
                gc = gspread.authorize(creds)
                sh = gc.open_by_url(sheet_url)
                ws = sh.worksheet("Master_Tracker")
                df = pd.DataFrame(ws.get_all_records())

                if df.empty:
                    st.warning("Sheet is empty")
                    st.stop()

                df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
                cutoff = datetime.now() - timedelta(days=30)
                recent = df[df['Timestamp'] >= cutoff].copy()

                total_leads = len(recent[recent.get('Type', pd.Series()).astype(str).str.contains('Leads', na=False)])
                perf_posts = len(recent[recent.get('Type', pd.Series()).astype(str).str.contains('Performance', na=False)])

                st.success(f"**Last 30 Days**\n\n• Leads captured: **{total_leads}**\n• Performance posts tracked: **{perf_posts}**")
                st.dataframe(recent[['Timestamp', 'Channel', 'Type', 'Communication_Channel', 'Notes']].sort_values('Timestamp', ascending=False), use_container_width=True)

                # Optional Gemini summary
                if gemini_key:
                    genai.configure(api_key=gemini_key)
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    prompt = f"""You are a social media growth expert for Chinese platforms.
Analyze this data and give a short, actionable report:

{recent.to_markdown(index=False)}

Structure:
1. Top channel
2. Lead count & quality
3. Performance insights
4. 3 concrete next-week recommendations"""

                    ai_resp = model.generate_content(prompt)
                    st.markdown("### AI Insights")
                    st.markdown(ai_resp.text)
                else:
                    st.info("Add Gemini key in sidebar for AI-powered recommendations")

            except Exception as e:
                st.error(f"Report failed: {e}")
                st.info("Make sure sheet is named **Master_Tracker** and shared with your service account.")

st.caption("Social Media Tracker • Powered by Make.com + Streamlit")
