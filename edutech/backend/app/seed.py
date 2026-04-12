"""
Seed Data Script - Database mein initial data daalo
====================================================
Ye script MongoDB mein initial data insert karta hai:
- Courses (Math, Science, English, Hindi, SST, Computer Science)
- Chapters (har course ke 5-6 chapters)
- Badges (12 achievement badges)
- Avatars (10 character store avatars)
- Quiz Questions (sample questions bank)
- Admin user (default admin account)

Run kaise kare: poetry run python -m app.seed
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.database import MONGODB_URI, DATABASE_NAME
from app.utils.auth import hash_password
from app.utils.helpers import get_current_timestamp


async def seed_database():
    """
    Database mein initial/seed data daalo.
    Agar data pehle se hai toh skip karega (duplicate nahi banega).
    """
    print("Seeding database...")
    
    # MongoDB se connect karo
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    # ============================
    # 1. Admin User Create Karo
    # ============================
    users = db["users"]
    existing_admin = await users.find_one({"email": "admin@aiedu.com"})
    if not existing_admin:
        admin_user = {
            "name": "Admin",
            "email": "admin@aiedu.com",
            "password_hash": hash_password("admin123"),  # Default admin password
            "role": "admin",
            "avatar": "👑",
            "xp": 0,
            "level": 1,
            "streak": 0,
            "last_active_date": None,
            "language": "hinglish",
            "phone": "",
            "subscription": "premium",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        await users.insert_one(admin_user)
        print("  Admin user created (admin@aiedu.com / admin123)")
    else:
        print("  Admin user already exists, skipping.")
    
    # Demo student user
    existing_demo = await users.find_one({"email": "demo@aiedu.com"})
    if not existing_demo:
        demo_user = {
            "name": "Demo Student",
            "email": "demo@aiedu.com",
            "password_hash": hash_password("demo123"),
            "role": "student",
            "avatar": "🦁",
            "xp": 750,
            "level": 2,
            "streak": 5,
            "last_active_date": None,
            "language": "hinglish",
            "phone": "",
            "subscription": "free",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        await users.insert_one(demo_user)
        print("  Demo student created (demo@aiedu.com / demo123)")
    else:
        print("  Demo student already exists, skipping.")
    
    # Demo parent user
    existing_parent = await users.find_one({"email": "parent@aiedu.com"})
    if not existing_parent:
        parent_user = {
            "name": "Demo Parent",
            "email": "parent@aiedu.com",
            "password_hash": hash_password("parent123"),
            "role": "parent",
            "avatar": "👨‍👩‍👦",
            "xp": 0,
            "level": 1,
            "streak": 0,
            "last_active_date": None,
            "language": "hindi",
            "phone": "",
            "subscription": "free",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        await users.insert_one(parent_user)
        print("  Demo parent created (parent@aiedu.com / parent123)")
    else:
        print("  Demo parent already exists, skipping.")

    # ============================
    # 2. Courses Create Karo
    # ============================
    courses = db["courses"]
    existing_courses = await courses.count_documents({})
    
    if existing_courses == 0:
        course_data = [
            {
                "title": "Mathematics",
                "subject": "math",
                "grade": 10,
                "board": "CBSE",
                "icon": "📐",
                "color": "violet",
                "description": "CBSE Class 10 Mathematics - Algebra, Geometry, Trigonometry, Statistics aur more.",
                "created_at": get_current_timestamp(),
                "updated_at": get_current_timestamp(),
            },
            {
                "title": "Science",
                "subject": "science",
                "grade": 10,
                "board": "CBSE",
                "icon": "🔬",
                "color": "cyan",
                "description": "CBSE Class 10 Science - Physics, Chemistry aur Biology ke saare chapters.",
                "created_at": get_current_timestamp(),
                "updated_at": get_current_timestamp(),
            },
            {
                "title": "English",
                "subject": "english",
                "grade": 10,
                "board": "CBSE",
                "icon": "📖",
                "color": "emerald",
                "description": "CBSE Class 10 English - Grammar, Literature, Writing Skills.",
                "created_at": get_current_timestamp(),
                "updated_at": get_current_timestamp(),
            },
            {
                "title": "Hindi",
                "subject": "hindi",
                "grade": 10,
                "board": "CBSE",
                "icon": "📝",
                "color": "amber",
                "description": "CBSE Class 10 Hindi - Kshitij, Sparsh, Vyakaran.",
                "created_at": get_current_timestamp(),
                "updated_at": get_current_timestamp(),
            },
            {
                "title": "Social Science",
                "subject": "sst",
                "grade": 10,
                "board": "CBSE",
                "icon": "🌍",
                "color": "rose",
                "description": "CBSE Class 10 SST - History, Geography, Political Science, Economics.",
                "created_at": get_current_timestamp(),
                "updated_at": get_current_timestamp(),
            },
            {
                "title": "Computer Science",
                "subject": "cs",
                "grade": 10,
                "board": "CBSE",
                "icon": "💻",
                "color": "indigo",
                "description": "CBSE Class 10 Computer Science - Python, Data Handling, Cyber Safety.",
                "created_at": get_current_timestamp(),
                "updated_at": get_current_timestamp(),
            },
        ]
        
        result = await courses.insert_many(course_data)
        course_ids = [str(cid) for cid in result.inserted_ids]
        print(f"  {len(course_ids)} courses created.")
        
        # ============================
        # 3. Chapters Create Karo
        # ============================
        chapters = db["chapters"]
        
        # Math chapters
        math_chapters = [
            {"course_id": course_ids[0], "title": "Real Numbers", "content": "Real numbers, Euclid's division algorithm, Fundamental Theorem of Arithmetic, irrational numbers.", "video_url": "", "order": 1, "created_at": get_current_timestamp()},
            {"course_id": course_ids[0], "title": "Polynomials", "content": "Zeros of polynomial, relationship between zeros and coefficients, division algorithm.", "video_url": "", "order": 2, "created_at": get_current_timestamp()},
            {"course_id": course_ids[0], "title": "Linear Equations", "content": "Pair of linear equations in two variables, graphical and algebraic methods.", "video_url": "", "order": 3, "created_at": get_current_timestamp()},
            {"course_id": course_ids[0], "title": "Quadratic Equations", "content": "Standard form, factorization, completing the square, quadratic formula, nature of roots.", "video_url": "", "order": 4, "created_at": get_current_timestamp()},
            {"course_id": course_ids[0], "title": "Trigonometry", "content": "Trigonometric ratios, identities, heights and distances.", "video_url": "", "order": 5, "created_at": get_current_timestamp()},
        ]
        
        # Science chapters
        science_chapters = [
            {"course_id": course_ids[1], "title": "Chemical Reactions & Equations", "content": "Types of chemical reactions, balancing equations, corrosion, rancidity.", "video_url": "", "order": 1, "created_at": get_current_timestamp()},
            {"course_id": course_ids[1], "title": "Acids, Bases and Salts", "content": "Properties, indicators, pH scale, salts and their uses.", "video_url": "", "order": 2, "created_at": get_current_timestamp()},
            {"course_id": course_ids[1], "title": "Light - Reflection & Refraction", "content": "Laws of reflection, spherical mirrors, refraction, lenses, lens formula.", "video_url": "", "order": 3, "created_at": get_current_timestamp()},
            {"course_id": course_ids[1], "title": "Electricity", "content": "Electric current, potential difference, Ohm's law, resistance, power.", "video_url": "", "order": 4, "created_at": get_current_timestamp()},
            {"course_id": course_ids[1], "title": "Life Processes", "content": "Nutrition, respiration, transportation, excretion in organisms.", "video_url": "", "order": 5, "created_at": get_current_timestamp()},
        ]
        
        # English chapters
        english_chapters = [
            {"course_id": course_ids[2], "title": "Tenses", "content": "Present, Past, Future tenses with examples and exercises.", "video_url": "", "order": 1, "created_at": get_current_timestamp()},
            {"course_id": course_ids[2], "title": "Active & Passive Voice", "content": "Converting sentences from active to passive voice and vice versa.", "video_url": "", "order": 2, "created_at": get_current_timestamp()},
            {"course_id": course_ids[2], "title": "Direct & Indirect Speech", "content": "Rules for converting direct speech to indirect speech.", "video_url": "", "order": 3, "created_at": get_current_timestamp()},
            {"course_id": course_ids[2], "title": "Letter Writing", "content": "Formal and informal letter writing with formats and examples.", "video_url": "", "order": 4, "created_at": get_current_timestamp()},
            {"course_id": course_ids[2], "title": "Essay Writing", "content": "Essay structure, topics, tips for writing effective essays.", "video_url": "", "order": 5, "created_at": get_current_timestamp()},
        ]
        
        # Hindi chapters
        hindi_chapters = [
            {"course_id": course_ids[3], "title": "पद - सूरदास", "content": "सूरदास के पद, भक्ति काव्य, कृष्ण लीला।", "video_url": "", "order": 1, "created_at": get_current_timestamp()},
            {"course_id": course_ids[3], "title": "राम-लक्ष्मण-परशुराम संवाद", "content": "तुलसीदास, राम-परशुराम संवाद, वीर रस।", "video_url": "", "order": 2, "created_at": get_current_timestamp()},
            {"course_id": course_ids[3], "title": "संधि", "content": "स्वर संधि, व्यंजन संधि, विसर्ग संधि। नियम और उदाहरण।", "video_url": "", "order": 3, "created_at": get_current_timestamp()},
            {"course_id": course_ids[3], "title": "समास", "content": "समास के प्रकार - अव्ययीभाव, तत्पुरुष, कर्मधारय, द्विगु, द्वन्द्व, बहुव्रीहि।", "video_url": "", "order": 4, "created_at": get_current_timestamp()},
            {"course_id": course_ids[3], "title": "पत्र लेखन", "content": "औपचारिक और अनौपचारिक पत्र लेखन।", "video_url": "", "order": 5, "created_at": get_current_timestamp()},
        ]
        
        # SST chapters
        sst_chapters = [
            {"course_id": course_ids[4], "title": "Rise of Nationalism in Europe", "content": "French Revolution, nationalism, unification of Germany and Italy.", "video_url": "", "order": 1, "created_at": get_current_timestamp()},
            {"course_id": course_ids[4], "title": "Resources and Development", "content": "Types of resources, soil types, soil erosion, conservation.", "video_url": "", "order": 2, "created_at": get_current_timestamp()},
            {"course_id": course_ids[4], "title": "Power Sharing", "content": "Belgium and Sri Lanka case studies, forms of power sharing.", "video_url": "", "order": 3, "created_at": get_current_timestamp()},
            {"course_id": course_ids[4], "title": "Development", "content": "National development, per capita income, HDI, sustainability.", "video_url": "", "order": 4, "created_at": get_current_timestamp()},
            {"course_id": course_ids[4], "title": "Indian Economy", "content": "Sectors of Indian economy, GDP, employment, NREGA.", "video_url": "", "order": 5, "created_at": get_current_timestamp()},
        ]
        
        # CS chapters
        cs_chapters = [
            {"course_id": course_ids[5], "title": "Python Basics", "content": "Variables, data types, input/output, operators, expressions.", "video_url": "", "order": 1, "created_at": get_current_timestamp()},
            {"course_id": course_ids[5], "title": "Control Structures", "content": "If-else, loops (for, while), break, continue, nested loops.", "video_url": "", "order": 2, "created_at": get_current_timestamp()},
            {"course_id": course_ids[5], "title": "Functions", "content": "Defining functions, parameters, return values, scope, recursion.", "video_url": "", "order": 3, "created_at": get_current_timestamp()},
            {"course_id": course_ids[5], "title": "Lists & Dictionaries", "content": "Lists, tuples, dictionaries, operations, methods, comprehensions.", "video_url": "", "order": 4, "created_at": get_current_timestamp()},
            {"course_id": course_ids[5], "title": "Cyber Safety", "content": "Internet safety, privacy, social media ethics, cyber crimes.", "video_url": "", "order": 5, "created_at": get_current_timestamp()},
        ]
        
        all_chapters = math_chapters + science_chapters + english_chapters + hindi_chapters + sst_chapters + cs_chapters
        await chapters.insert_many(all_chapters)
        print(f"  {len(all_chapters)} chapters created.")
    else:
        print(f"  Courses already exist ({existing_courses}), skipping courses & chapters.")
    
    # ============================
    # 4. Badges Create Karo
    # ============================
    badges = db["badges"]
    existing_badges = await badges.count_documents({})
    
    if existing_badges == 0:
        badge_data = [
            {"name": "First Step", "description": "Apna pehla chapter complete karo", "icon": "🌟", "rarity": "common", "condition_type": "chapters", "condition_value": 1, "order": 1, "created_at": get_current_timestamp()},
            {"name": "Quiz Starter", "description": "Apna pehla quiz do", "icon": "📝", "rarity": "common", "condition_type": "quizzes", "condition_value": 1, "order": 2, "created_at": get_current_timestamp()},
            {"name": "XP Hunter", "description": "500 XP earn karo", "icon": "⚡", "rarity": "common", "condition_type": "xp", "condition_value": 500, "order": 3, "created_at": get_current_timestamp()},
            {"name": "Week Warrior", "description": "7 din ki streak banao", "icon": "🔥", "rarity": "rare", "condition_type": "streak", "condition_value": 7, "order": 4, "created_at": get_current_timestamp()},
            {"name": "Knowledge Seeker", "description": "10 chapters complete karo", "icon": "📚", "rarity": "rare", "condition_type": "chapters", "condition_value": 10, "order": 5, "created_at": get_current_timestamp()},
            {"name": "Quiz Master", "description": "10 quizzes complete karo", "icon": "🎯", "rarity": "rare", "condition_type": "quizzes", "condition_value": 10, "order": 6, "created_at": get_current_timestamp()},
            {"name": "XP Champion", "description": "2000 XP earn karo", "icon": "💎", "rarity": "epic", "condition_type": "xp", "condition_value": 2000, "order": 7, "created_at": get_current_timestamp()},
            {"name": "Month Streak", "description": "30 din ki streak banao", "icon": "🏆", "rarity": "epic", "condition_type": "streak", "condition_value": 30, "order": 8, "created_at": get_current_timestamp()},
            {"name": "Scholar", "description": "50 chapters complete karo", "icon": "🎓", "rarity": "epic", "condition_type": "chapters", "condition_value": 50, "order": 9, "created_at": get_current_timestamp()},
            {"name": "Quiz Legend", "description": "50 quizzes complete karo", "icon": "👑", "rarity": "legendary", "condition_type": "quizzes", "condition_value": 50, "order": 10, "created_at": get_current_timestamp()},
            {"name": "XP God", "description": "5000 XP earn karo", "icon": "🌈", "rarity": "legendary", "condition_type": "xp", "condition_value": 5000, "order": 11, "created_at": get_current_timestamp()},
            {"name": "100 Day Streak", "description": "100 din ki streak banao", "icon": "🏅", "rarity": "legendary", "condition_type": "streak", "condition_value": 100, "order": 12, "created_at": get_current_timestamp()},
        ]
        await badges.insert_many(badge_data)
        print(f"  {len(badge_data)} badges created.")
    else:
        print(f"  Badges already exist ({existing_badges}), skipping.")
    
    # ============================
    # 5. Avatars Create Karo
    # ============================
    avatars = db["avatars"]
    existing_avatars = await avatars.count_documents({})
    
    if existing_avatars == 0:
        avatar_data = [
            {"name": "Lion King", "emoji": "🦁", "description": "Brave aur fearless leader", "rarity": "common", "price": 0, "created_at": get_current_timestamp()},
            {"name": "Smart Fox", "emoji": "🦊", "description": "Clever aur quick thinker", "rarity": "common", "price": 100, "created_at": get_current_timestamp()},
            {"name": "Wise Owl", "emoji": "🦉", "description": "Knowledge ka symbol", "rarity": "common", "price": 200, "created_at": get_current_timestamp()},
            {"name": "Cool Cat", "emoji": "😎", "description": "Always cool and calm", "rarity": "rare", "price": 500, "created_at": get_current_timestamp()},
            {"name": "Rocket Star", "emoji": "🚀", "description": "Sky is not the limit!", "rarity": "rare", "price": 750, "created_at": get_current_timestamp()},
            {"name": "Dragon Fire", "emoji": "🐉", "description": "Powerful aur unstoppable", "rarity": "epic", "price": 1000, "created_at": get_current_timestamp()},
            {"name": "Unicorn Magic", "emoji": "🦄", "description": "Magical aur unique", "rarity": "epic", "price": 1500, "created_at": get_current_timestamp()},
            {"name": "Phoenix Rise", "emoji": "🔥", "description": "Rise from the ashes", "rarity": "epic", "price": 2000, "created_at": get_current_timestamp()},
            {"name": "Diamond Crown", "emoji": "👑", "description": "The ultimate achiever", "rarity": "legendary", "price": 3000, "created_at": get_current_timestamp()},
            {"name": "Galaxy Explorer", "emoji": "🌌", "description": "Explorer of infinite knowledge", "rarity": "legendary", "price": 5000, "created_at": get_current_timestamp()},
        ]
        await avatars.insert_many(avatar_data)
        print(f"  {len(avatar_data)} avatars created.")
    else:
        print(f"  Avatars already exist ({existing_avatars}), skipping.")
    
    # ============================
    # 6. Quiz Questions Create Karo
    # ============================
    quiz_questions = db["quiz_questions"]
    existing_questions = await quiz_questions.count_documents({})
    
    if existing_questions == 0:
        questions_data = [
            # Math - Easy
            {"question": "2 + 3 = ?", "options": ["4", "5", "6", "7"], "correct_option": 1, "subject": "math", "grade": 10, "difficulty": "easy", "explanation": "Simple addition: 2 + 3 = 5", "created_at": get_current_timestamp()},
            {"question": "10 × 5 = ?", "options": ["40", "45", "50", "55"], "correct_option": 2, "subject": "math", "grade": 10, "difficulty": "easy", "explanation": "10 × 5 = 50", "created_at": get_current_timestamp()},
            {"question": "√25 = ?", "options": ["3", "4", "5", "6"], "correct_option": 2, "subject": "math", "grade": 10, "difficulty": "easy", "explanation": "5 × 5 = 25, so √25 = 5", "created_at": get_current_timestamp()},
            {"question": "15% of 200 = ?", "options": ["20", "25", "30", "35"], "correct_option": 2, "subject": "math", "grade": 10, "difficulty": "easy", "explanation": "15/100 × 200 = 30", "created_at": get_current_timestamp()},
            {"question": "HCF of 12 and 18 = ?", "options": ["3", "6", "9", "12"], "correct_option": 1, "subject": "math", "grade": 10, "difficulty": "easy", "explanation": "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. HCF = 6", "created_at": get_current_timestamp()},
            
            # Math - Medium
            {"question": "x² - 5x + 6 = 0 ka solution?", "options": ["x=1,6", "x=2,3", "x=3,4", "x=-2,-3"], "correct_option": 1, "subject": "math", "grade": 10, "difficulty": "medium", "explanation": "(x-2)(x-3)=0, so x=2 or x=3", "created_at": get_current_timestamp()},
            {"question": "sin 30° = ?", "options": ["0", "1/2", "1/√2", "√3/2"], "correct_option": 1, "subject": "math", "grade": 10, "difficulty": "medium", "explanation": "sin 30° = 1/2 (standard value)", "created_at": get_current_timestamp()},
            {"question": "AP: 2,5,8,11... ka 10th term?", "options": ["27", "29", "31", "33"], "correct_option": 1, "subject": "math", "grade": 10, "difficulty": "medium", "explanation": "a=2, d=3, T10 = 2 + (10-1)×3 = 2+27 = 29", "created_at": get_current_timestamp()},
            {"question": "Circle ka area jiska radius 7 cm?", "options": ["144 cm²", "154 cm²", "164 cm²", "174 cm²"], "correct_option": 1, "subject": "math", "grade": 10, "difficulty": "medium", "explanation": "A = πr² = 22/7 × 7 × 7 = 154 cm²", "created_at": get_current_timestamp()},
            {"question": "tan 45° = ?", "options": ["0", "1/2", "1", "√3"], "correct_option": 2, "subject": "math", "grade": 10, "difficulty": "medium", "explanation": "tan 45° = 1 (standard value)", "created_at": get_current_timestamp()},
            
            # Science - Easy
            {"question": "Pani ka chemical formula?", "options": ["H2O", "CO2", "NaCl", "O2"], "correct_option": 0, "subject": "science", "grade": 10, "difficulty": "easy", "explanation": "Pani = H2O (2 Hydrogen + 1 Oxygen)", "created_at": get_current_timestamp()},
            {"question": "Plants apna food kaise banate hain?", "options": ["Respiration", "Photosynthesis", "Digestion", "Osmosis"], "correct_option": 1, "subject": "science", "grade": 10, "difficulty": "easy", "explanation": "Photosynthesis se plants sunlight, CO2 aur water se food banate hain", "created_at": get_current_timestamp()},
            {"question": "Sabse chhota particle?", "options": ["Molecule", "Atom", "Cell", "Electron"], "correct_option": 3, "subject": "science", "grade": 10, "difficulty": "easy", "explanation": "Electron sabse chhota subatomic particle hai", "created_at": get_current_timestamp()},
            {"question": "Vitamin C kismein milta hai?", "options": ["Milk", "Orange", "Rice", "Egg"], "correct_option": 1, "subject": "science", "grade": 10, "difficulty": "easy", "explanation": "Citrus fruits jaise orange mein Vitamin C hota hai", "created_at": get_current_timestamp()},
            {"question": "Sound travel nahi kar sakta:", "options": ["Air mein", "Water mein", "Vacuum mein", "Metal mein"], "correct_option": 2, "subject": "science", "grade": 10, "difficulty": "easy", "explanation": "Sound ko medium chahiye travel karne ke liye, vacuum mein koi medium nahi hota", "created_at": get_current_timestamp()},
            
            # Science - Medium
            {"question": "Ohm's Law ka formula?", "options": ["V = IR", "V = I/R", "V = I+R", "V = I-R"], "correct_option": 0, "subject": "science", "grade": 10, "difficulty": "medium", "explanation": "V = IR (Voltage = Current × Resistance)", "created_at": get_current_timestamp()},
            {"question": "pH 7 se kam hone par solution hota hai:", "options": ["Neutral", "Acidic", "Basic", "Salt"], "correct_option": 1, "subject": "science", "grade": 10, "difficulty": "medium", "explanation": "pH < 7 = Acidic, pH = 7 = Neutral, pH > 7 = Basic", "created_at": get_current_timestamp()},
            {"question": "Concave mirror mein image kab real banti hai?", "options": ["Object F par", "Object C par", "Object C se aage", "Object F se pehle"], "correct_option": 2, "subject": "science", "grade": 10, "difficulty": "medium", "explanation": "Jab object center of curvature C se aage hota hai tab real image banti hai", "created_at": get_current_timestamp()},
            {"question": "DNA ka full form?", "options": ["Deoxyribose Nucleic Acid", "Deoxyribonucleic Acid", "Dinucleotide Acid", "Dual Nucleic Acid"], "correct_option": 1, "subject": "science", "grade": 10, "difficulty": "medium", "explanation": "DNA = Deoxyribonucleic Acid", "created_at": get_current_timestamp()},
            {"question": "1 kilowatt-hour = ?", "options": ["3.6 × 10³ J", "3.6 × 10⁶ J", "3.6 × 10⁹ J", "3.6 J"], "correct_option": 1, "subject": "science", "grade": 10, "difficulty": "medium", "explanation": "1 kWh = 1000 × 3600 = 3.6 × 10⁶ Joules", "created_at": get_current_timestamp()},
            
            # English - Easy
            {"question": "Past tense of 'go'?", "options": ["goed", "went", "gone", "going"], "correct_option": 1, "subject": "english", "grade": 10, "difficulty": "easy", "explanation": "go → went (irregular verb)", "created_at": get_current_timestamp()},
            {"question": "Which is a noun?", "options": ["run", "beautiful", "table", "quickly"], "correct_option": 2, "subject": "english", "grade": 10, "difficulty": "easy", "explanation": "table is a noun (naming word), run=verb, beautiful=adjective, quickly=adverb", "created_at": get_current_timestamp()},
            {"question": "Synonym of 'happy'?", "options": ["sad", "joyful", "angry", "tired"], "correct_option": 1, "subject": "english", "grade": 10, "difficulty": "easy", "explanation": "joyful = happy (same meaning)", "created_at": get_current_timestamp()},
            {"question": "Plural of 'child'?", "options": ["childs", "childes", "children", "child"], "correct_option": 2, "subject": "english", "grade": 10, "difficulty": "easy", "explanation": "child → children (irregular plural)", "created_at": get_current_timestamp()},
            {"question": "Antonym of 'brave'?", "options": ["strong", "cowardly", "bold", "fearless"], "correct_option": 1, "subject": "english", "grade": 10, "difficulty": "easy", "explanation": "brave ka opposite = cowardly", "created_at": get_current_timestamp()},
            
            # English - Medium
            {"question": "Active to Passive: 'She writes a letter.'", "options": ["A letter is written by her.", "A letter was written by her.", "A letter has been written by her.", "A letter is being written by her."], "correct_option": 0, "subject": "english", "grade": 10, "difficulty": "medium", "explanation": "Present simple active → is/am/are + V3 + by + agent", "created_at": get_current_timestamp()},
            {"question": "Correct sentence?", "options": ["He don't know.", "He doesn't knows.", "He doesn't know.", "He not know."], "correct_option": 2, "subject": "english", "grade": 10, "difficulty": "medium", "explanation": "He/She/It + doesn't + base form of verb", "created_at": get_current_timestamp()},
            {"question": "Figure of speech: 'The wind howled'", "options": ["Simile", "Metaphor", "Personification", "Alliteration"], "correct_option": 2, "subject": "english", "grade": 10, "difficulty": "medium", "explanation": "Wind ko human quality (howling) di gayi = Personification", "created_at": get_current_timestamp()},
            {"question": "Indirect speech: He said, 'I am happy.'", "options": ["He said that he is happy.", "He said that he was happy.", "He said that I am happy.", "He said that I was happy."], "correct_option": 1, "subject": "english", "grade": 10, "difficulty": "medium", "explanation": "Direct to indirect: am → was, I → he", "created_at": get_current_timestamp()},
            {"question": "Which is an adverb?", "options": ["beautiful", "beauty", "beautifully", "beautify"], "correct_option": 2, "subject": "english", "grade": 10, "difficulty": "medium", "explanation": "beautifully modifies a verb = adverb (-ly ending)", "created_at": get_current_timestamp()},
        ]
        
        await quiz_questions.insert_many(questions_data)
        print(f"  {len(questions_data)} quiz questions created.")
    else:
        print(f"  Quiz questions already exist ({existing_questions}), skipping.")
    
    # ============================
    # 7. Indexes Create Karo (Performance ke liye)
    # ============================
    print("  Creating database indexes...")
    
    # Users indexes
    await users.create_index("email", unique=True)
    
    # Chapters index
    chapters_coll = db["chapters"]
    await chapters_coll.create_index([("course_id", 1), ("order", 1)])
    
    # Progress indexes
    progress = db["progress"]
    await progress.create_index([("user_id", 1), ("course_id", 1), ("chapter_id", 1)])
    
    # Quiz results index
    quiz_results = db["quiz_results"]
    await quiz_results.create_index([("user_id", 1), ("status", 1)])
    
    # Activity log index
    activity = db["activity_log"]
    await activity.create_index([("user_id", 1), ("timestamp", -1)])
    
    # Notifications index
    notif = db["notifications"]
    await notif.create_index([("user_id", 1), ("read", 1)])
    
    # Chat history index
    chat = db["chat_history"]
    await chat.create_index([("user_id", 1), ("timestamp", -1)])
    
    print("  Indexes created!")
    
    print("\nSeeding complete! Database is ready.")
    print("\nDemo Accounts:")
    print("  Admin:   admin@aiedu.com / admin123")
    print("  Student: demo@aiedu.com / demo123")
    print("  Parent:  parent@aiedu.com / parent123")
    
    # Connection band karo
    client.close()


# Script directly run karne ke liye
if __name__ == "__main__":
    asyncio.run(seed_database())
