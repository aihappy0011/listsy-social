# Ek baar ka setup (owner + Claude saath)

Password / token sirf owner khud daalta hai. Claude kabhi nahi dekhta.

## A. GitHub repo (Claude banata hai, owner ki haan ke baad)
1. Naya **public** repo `listsy-social` (photos public hi hongi, Instagram pe jaani hain). Claude `agent/` folder push karta hai.
2. Repo → Settings → **Pages** → Branch `main` / root → Save. Link: `https://aihappy0011.github.io/listsy-social`.
3. Repo → Settings → Secrets and variables → Actions → **Variables**: `MEDIA_BASE` = upar wala Pages link.
4. Phone pe **GitHub app** install karo, `aihappy0011` se login, Notifications on. Approval issue yahin aayega.

## B. Instagram chaabi (15 min, laptop, owner khud)
Account @listsyai pehle se Professional hai. Facebook Page ki zaroorat nahi.
1. developers.facebook.com → My Apps → Create app → use case **"Manage messaging & content on Instagram"**.
2. Instagram → **API setup with Instagram login** → "Add account" → @listsyai se login → permissions allow.
3. **Generate token** → copy → repo → Settings → Secrets and variables → Actions → **Secrets** → New → naam `IG_TOKEN`, value = token. (60 din chalta hai.)

## C. Kaise chalta hai
- Har hafte nayi posts aate hi GitHub app mein issue: "📝 N posts approval ke liye". Comment mein likho:
  **HAAN** (sab approve) · **NAHI 2** (#2 hatao) · **STOP** (sab roko) · **STATUS**
- Robot har ghante (8:35 am – 9:35 pm) time aayi hui approved post daalta hai.
- Post fail ho (jaise chaabi expire) to "⚠️ Listsy Agent: kuch fail hua" issue aayega → step B dobara.
