"""
Seed Script - CBSE & ICSE Courses for Class 1-12
=================================================
Ye script MongoDB mein saare courses add karta hai.
Run: python -m scripts.seed_courses (from backend directory)
"""

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_ATLAS_URI", "mongodb://localhost:27017")
DATABASE_NAME = "ai_edu"

# Gradient colors for courses
COLORS = {
    "math": "from-blue-500 to-indigo-600",
    "science": "from-green-500 to-emerald-600",
    "english": "from-pink-500 to-rose-600",
    "hindi": "from-orange-500 to-amber-600",
    "social_science": "from-purple-500 to-violet-600",
    "history": "from-purple-500 to-violet-600",
    "geography": "from-teal-500 to-cyan-600",
    "civics": "from-indigo-500 to-blue-600",
    "economics": "from-yellow-500 to-amber-600",
    "physics": "from-cyan-500 to-blue-600",
    "chemistry": "from-red-500 to-orange-600",
    "biology": "from-lime-500 to-green-600",
    "computer_science": "from-gray-500 to-slate-600",
    "evs": "from-emerald-500 to-teal-600",
    "art": "from-fuchsia-500 to-pink-600",
    "moral_science": "from-amber-500 to-yellow-600",
    "gk": "from-sky-500 to-blue-600",
    "sanskrit": "from-orange-600 to-red-600",
    "physical_education": "from-green-600 to-lime-600",
    "business_studies": "from-slate-500 to-gray-600",
    "accountancy": "from-emerald-600 to-green-600",
    "political_science": "from-blue-600 to-indigo-600",
    "sociology": "from-violet-500 to-purple-600",
    "psychology": "from-rose-500 to-pink-600",
    "home_science": "from-amber-500 to-orange-600",
    "informatics_practices": "from-cyan-600 to-teal-600",
}

ICONS = {
    "math": "🔢",
    "science": "🔬",
    "english": "📖",
    "hindi": "📝",
    "social_science": "🌍",
    "history": "🏛️",
    "geography": "🗺️",
    "civics": "⚖️",
    "economics": "💰",
    "physics": "⚡",
    "chemistry": "🧪",
    "biology": "🧬",
    "computer_science": "💻",
    "evs": "🌱",
    "art": "🎨",
    "moral_science": "📜",
    "gk": "🧠",
    "sanskrit": "📜",
    "physical_education": "🏃",
    "business_studies": "📊",
    "accountancy": "📒",
    "political_science": "🏛️",
    "sociology": "👥",
    "psychology": "🧠",
    "home_science": "🏠",
    "informatics_practices": "🖥️",
}

# ==========================================
# CBSE Syllabus - Class 1 to 12
# ==========================================

CBSE_SUBJECTS = {
    # Class 1-5 (Primary)
    1: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    2: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    3: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    4: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    5: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    # Class 6-8 (Middle)
    6: ["Mathematics", "Science", "English", "Hindi", "Social Science", "Sanskrit", "Computer Science"],
    7: ["Mathematics", "Science", "English", "Hindi", "Social Science", "Sanskrit", "Computer Science"],
    8: ["Mathematics", "Science", "English", "Hindi", "Social Science", "Sanskrit", "Computer Science"],
    # Class 9-10 (Secondary)
    9: ["Mathematics", "Science", "English", "Hindi", "Social Science", "Computer Science"],
    10: ["Mathematics", "Science", "English", "Hindi", "Social Science", "Computer Science"],
    # Class 11-12 (Senior Secondary - Science Stream)
    11: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "Physical Education"],
    12: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "Physical Education"],
}

# CBSE Chapter details per subject per class
CBSE_CHAPTERS: dict[int, dict[str, list[str]]] = {
    # ---- Class 1 ----
    1: {
        "Mathematics": [
            "Shapes and Space", "Numbers from One to Nine", "Addition",
            "Subtraction", "Numbers from Ten to Twenty", "Time",
            "Measurement", "Numbers from Twenty-one to Fifty", "Data Handling",
            "Patterns", "Numbers", "Money", "How Many"
        ],
        "English": [
            "A Happy Child", "Three Little Pigs", "Lalu and Peelu",
            "Humpty Dumpty", "A Kite", "A Little Turtle",
            "Mittu and the Yellow Mango", "Merry-Go-Round",
            "Circle", "Flying Man", "The Bubble, the Straw and the Shoe"
        ],
        "Hindi": [
            "झूला", "आम की कहानी", "आम की टोकरी",
            "पत्ते ही पत्ते", "पकौड़ी", "छुक-छुक गाड़ी",
            "रसोईघर", "चुहो! म्याऊँ सो रही है", "बंदर और गिलहरी",
            "पगड़ी", "पतंग", "गेंद-बल्ला"
        ],
        "EVS": [
            "My Family", "My Body", "Food We Eat",
            "Our Clothes", "Our House", "Animals Around Us",
            "Plants Around Us", "Water", "Weather and Seasons",
            "Festivals", "Transport", "Safety Rules"
        ],
        "Art": ["Drawing Basics", "Colours", "Paper Craft", "Clay Modelling"],
        "Moral Science": ["Good Habits", "Honesty", "Sharing", "Kindness"],
        "GK": ["My Country", "Animals", "Fruits and Vegetables", "Festivals of India"],
    },
    # ---- Class 2 ----
    2: {
        "Mathematics": [
            "What is Long, What is Round?", "Counting in Groups",
            "How Much Can You Carry?", "Counting in Tens",
            "Patterns", "Footprints", "Jugs and Mugs",
            "Tens and Ones", "My Funday", "Add Our Points",
            "Lines and Lines", "Give and Take", "The Longest Step",
            "Birds Come, Birds Go", "How Many Ponytails?"
        ],
        "English": [
            "First Day at School", "Haldi's Adventure",
            "I am Lucky!", "I Want", "A Smile",
            "The Wind and the Sun", "Rain", "Storm in the Garden",
            "Zoo Manners", "Funny Bunny"
        ],
        "Hindi": [
            "ऊँट चला", "भालू ने खेली फुटबॉल", "म्याऊँ, म्याऊँ!!",
            "अधिक बलवान कौन", "दोस्त की मदद", "बहुत हुआ",
            "मेरी किताब", "तितली और कली", "बुलबुल"
        ],
        "EVS": [
            "My School", "Our Neighbourhood", "Cleanliness",
            "Air and Water", "Plants and Trees", "Animal Homes",
            "Healthy Food", "Our Helpers", "Festivals We Celebrate",
            "Good Manners"
        ],
        "Art": ["Drawing Animals", "Vegetable Printing", "Collage", "Origami"],
        "Moral Science": ["Respect for Elders", "Teamwork", "Truthfulness", "Patience"],
        "GK": ["Indian States", "Famous Places", "National Symbols", "Inventions"],
    },
    # ---- Class 3 ----
    3: {
        "Mathematics": [
            "Where to Look From", "Fun with Numbers", "Give and Take",
            "Long and Short", "Shapes and Designs", "Fun with Give and Take",
            "Time Goes On...", "Who is Heavier?", "How Many Times?",
            "Play with Patterns", "Jugs and Mugs", "Can We Share?",
            "Smart Charts!", "Rupees and Paise"
        ],
        "English": [
            "Good Morning", "The Magic Garden", "Bird Talk",
            "Nina and the Baby Sparrows", "The Enormous Turnip",
            "Sea Song", "A Little Fish Story", "The Balloon Man",
            "Don't Tell", "He is My Brother"
        ],
        "Hindi": [
            "कक्कू", "शेखीबाज़ मक्खी", "चाँद वाली अम्मा",
            "मन करता है", "बहादुर बित्तो", "हमसे सब कहते",
            "टिपटिपवा", "बंदर बाँट", "अक्ल बड़ी या भैंस"
        ],
        "EVS": [
            "Poonam's Day Out", "The Plant Fairy", "Water O Water",
            "Our First School", "Chhotu's House", "Foods We Eat",
            "Saying Without Speaking", "Flying High", "It's Raining",
            "What is Cooking?", "From Here to There", "Work We Do"
        ],
        "Art": ["Landscape Drawing", "Colour Mixing", "Mask Making", "Poster Making"],
        "Moral Science": ["Responsibility", "Courage", "Forgiveness", "Gratitude"],
        "GK": ["Solar System", "Water Bodies", "Famous Scientists", "Sports"],
    },
    # ---- Class 4 ----
    4: {
        "Mathematics": [
            "Building with Bricks", "Long and Short", "A Trip to Bhopal",
            "Tick-Tick-Tick", "The Way the World Looks", "The Junk Seller",
            "Jugs and Mugs", "Carts and Wheels", "Halves and Quarters",
            "Play with Patterns", "Tables and Shares", "How Heavy? How Light?",
            "Fields and Fences", "Smart Charts"
        ],
        "English": [
            "Wake Up!", "Neha's Alarm Clock", "Noses",
            "The Little Fir Tree", "Run!", "Nasruddin's Aim",
            "Don't Be Afraid of the Dark", "Helen Keller",
            "The Donkey", "I Had a Little Pony", "Hiawatha",
            "The Scholar's Mother Tongue", "The Giving Tree"
        ],
        "Hindi": [
            "मन के भोले-भाले बादल", "जैसा सवाल वैसा जवाब",
            "किरमिच की गेंद", "पापा जब बच्चे थे", "दोस्त की पोशाक",
            "नाव बनाओ नाव बनाओ", "दान का हिसाब", "कौन?",
            "स्वतंत्रता की ओर", "थप्प रोटी थप्प दाल",
            "पढ़क्कू की सूझ", "सुनीता की पहिया कुर्सी",
            "हुदहुद", "मुफ़्त ही मुफ़्त"
        ],
        "EVS": [
            "Going to School", "Ear to Ear", "A Day with Nandu",
            "The Story of Amrita", "Anita and the Honeybees",
            "Omana's Journey", "From the Window", "Reaching Grandmother's House",
            "Changing Families", "Hu Tu Tu, Hu Tu Tu",
            "The Valley of Flowers", "Changing Times", "A River's Tale"
        ],
        "Art": ["Still Life Drawing", "Rangoli Patterns", "Puppet Making", "Nature Sketching"],
        "Moral Science": ["Empathy", "Self-Discipline", "Environmental Care", "Leadership"],
        "GK": ["Indian History", "World Wonders", "Technology", "Health and Hygiene"],
    },
    # ---- Class 5 ----
    5: {
        "Mathematics": [
            "The Fish Tale", "Shapes and Angles", "How Many Squares?",
            "Parts and Wholes", "Does it Look the Same?", "Be My Multiple, I'll Be Your Factor",
            "Can You See the Pattern?", "Mapping Your Way", "Boxes and Sketches",
            "Tenths and Hundredths", "Area and its Boundary",
            "Smart Charts", "Ways to Multiply and Divide", "How Big? How Heavy?"
        ],
        "English": [
            "Wonderful Waste!", "Flying Together", "My Shadow",
            "Robinson Crusoe", "Crying", "My Elder Brother",
            "Gulliver's Travels", "Nobody's Friend", "Sing a Song of People",
            "Around the World", "The Lazy Frog"
        ],
        "Hindi": [
            "राख की रस्सी", "फ़सलों के त्योहार", "खिलौनेवाला",
            "नन्हा फ़नकार", "जहाँ चाह वहाँ राह", "चिट्ठी का सफ़र",
            "डाकिए की कहानी, कंवरसिंह की ज़ुबानी", "वे दिन भी क्या दिन थे",
            "पुराने जूते की कहानी", "बिशन की दिलेरी",
            "भगवान के डाकिए", "गुरु और चेला"
        ],
        "EVS": [
            "Super Senses", "A Snake Charmer's Story", "From Tasting to Digesting",
            "Mangoes Round the Year", "Seeds and Seeds", "Every Drop Counts",
            "Experiments with Water", "A Treat for Mosquitoes",
            "Up You Go!", "Walls Tell Stories", "Sunita in Space",
            "What if it Finishes...?", "A Shelter So High!",
            "When the Earth Shook!", "Blow Hot, Blow Cold"
        ],
        "Art": ["Perspective Drawing", "Calligraphy", "Model Making", "Digital Art Basics"],
        "Moral Science": ["Integrity", "Compassion", "Civic Sense", "Time Management"],
        "GK": ["Indian Constitution", "Space Exploration", "Famous Leaders", "Environment"],
    },
    # ---- Class 6 ----
    6: {
        "Mathematics": [
            "Knowing Our Numbers", "Whole Numbers", "Playing with Numbers",
            "Basic Geometrical Ideas", "Understanding Elementary Shapes",
            "Integers", "Fractions", "Decimals", "Data Handling",
            "Mensuration", "Algebra", "Ratio and Proportion", "Symmetry",
            "Practical Geometry"
        ],
        "Science": [
            "Food: Where Does It Come From?", "Components of Food",
            "Fibre to Fabric", "Sorting Materials into Groups",
            "Separation of Substances", "Changes Around Us",
            "Getting to Know Plants", "Body Movements",
            "The Living Organisms and Their Surroundings", "Motion and Measurement of Distances",
            "Light, Shadows and Reflections", "Electricity and Circuits",
            "Fun with Magnets", "Water", "Air Around Us",
            "Garbage In, Garbage Out"
        ],
        "English": [
            "Who Did Patrick's Homework?", "How the Dog Found Himself a New Master!",
            "Taro's Reward", "An Indian — American Woman in Space: Kalpana Chawla",
            "A Different Kind of School", "Who I Am",
            "Fair Play", "A Game of Chance",
            "Desert Animals", "The Banyan Tree"
        ],
        "Hindi": [
            "वह चिड़िया जो", "बचपन", "नादान दोस्त",
            "चाँद से थोड़ी-सी गप्पें", "अक्षरों का महत्व",
            "पार नज़र के", "साथी हाथ बढ़ाना", "ऐसे-ऐसे",
            "टिकट-अलबम", "झाँसी की रानी", "जो देखकर भी नहीं देखते",
            "संसार पुस्तक है"
        ],
        "Social Science": [
            "What, Where, How and When?", "On the Trail of the Earliest People",
            "From Gathering to Growing Food", "In the Earliest Cities",
            "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic",
            "New Questions and Ideas", "Ashoka, The Emperor Who Gave Up War",
            "Understanding Diversity", "Diversity and Discrimination",
            "What is Government?", "Key Elements of a Democratic Government",
            "The Earth in the Solar System", "Globe: Latitudes and Longitudes",
            "Motions of the Earth", "Maps", "Major Domains of the Earth",
            "Major Landforms of the Earth", "Our Country — India",
            "India: Climate, Vegetation and Wildlife"
        ],
        "Sanskrit": [
            "शब्द परिचयः", "शब्द परिचयः-II", "शब्द परिचयः-III",
            "विद्यालयः", "वृक्षाः", "समुद्रतटः",
            "बकस्य प्रतीकारः", "सूक्तिस्तबकः", "क्रीडास्पर्धा",
            "कृषिकाः कर्मवीराः", "पुष्पोत्सवः", "दशमः त्वम् असि"
        ],
        "Computer Science": [
            "Introduction to Computers", "More about Windows",
            "Microsoft Word Basics", "Formatting in Word",
            "Introduction to Internet", "Introduction to Scratch Programming",
            "More About Scratch", "Introduction to HTML"
        ],
    },
    # ---- Class 7 ----
    7: {
        "Mathematics": [
            "Integers", "Fractions and Decimals", "Data Handling",
            "Simple Equations", "Lines and Angles", "The Triangle and Its Properties",
            "Congruence of Triangles", "Comparing Quantities",
            "Rational Numbers", "Practical Geometry", "Perimeter and Area",
            "Algebraic Expressions", "Exponents and Powers",
            "Symmetry", "Visualising Solid Shapes"
        ],
        "Science": [
            "Nutrition in Plants", "Nutrition in Animals",
            "Fibre to Fabric", "Heat", "Acids, Bases and Salts",
            "Physical and Chemical Changes", "Weather, Climate and Adaptations of Animals to Climate",
            "Winds, Storms and Cyclones", "Soil", "Respiration in Organisms",
            "Transportation in Animals and Plants", "Reproduction in Plants",
            "Motion and Time", "Electric Current and Its Effects",
            "Light", "Water: A Precious Resource", "Forests: Our Lifeline",
            "Wastewater Story"
        ],
        "English": [
            "Three Questions", "A Gift of Chappals",
            "Gopal and the Hilsa Fish", "The Ashes That Made Trees Bloom",
            "Quality", "Expert Detectives", "The Invention of Vita-Wonk",
            "Fire: Friend and Foe", "A Bicycle in Good Repair",
            "The Story of Cricket"
        ],
        "Hindi": [
            "हम पंछी उन्मुक्त गगन के", "दादी माँ", "हिमालय की बेटियाँ",
            "कठपुतली", "मिठाईवाला", "रक्त और हमारा शरीर",
            "पापा खो गए", "शाम — एक किसान", "चिड़िया की बच्ची",
            "अपूर्व अनुभव", "रहीम के दोहे", "कंचा",
            "एक तिनका", "खानपान की बदलती तस्वीर", "नीलकंठ"
        ],
        "Social Science": [
            "Tracing Changes Through a Thousand Years",
            "New Kings and Kingdoms", "The Delhi Sultans",
            "The Mughal Empire", "Rulers and Buildings",
            "Towns, Traders and Craftspersons", "Tribes, Nomads and Settled Communities",
            "Devotional Paths to the Divine", "The Making of Regional Cultures",
            "On Equality", "Role of the Government in Health",
            "How the State Government Works", "Growing Up as Boys and Girls",
            "Environment", "Inside Our Earth", "Our Changing Earth",
            "Air", "Water", "Natural Vegetation and Wildlife",
            "Human Environment – Settlement, Transport and Communication",
            "Human Environment Interactions — The Tropical and the Subtropical Region",
            "Life in the Deserts"
        ],
        "Sanskrit": [
            "सुभाषितानि", "दुर्बुद्धिः विनश्यति", "स्वावलम्बनम्",
            "हास्यबालकविसम्मेलनम्", "पण्डिता रमाबाई", "सदाचारः",
            "संकल्पः सिद्धिदायकः", "त्रिवर्णः ध्वजः", "विश्वबन्धुत्वम्",
            "अहमपि विद्यालयं गमिष्यामि"
        ],
        "Computer Science": [
            "Advanced Word Processing", "Spreadsheets Basics",
            "Formulas in Spreadsheets", "PowerPoint Presentations",
            "Internet Safety", "Introduction to Python",
            "Python Variables and Data Types", "Loops in Python"
        ],
    },
    # ---- Class 8 ----
    8: {
        "Mathematics": [
            "Rational Numbers", "Linear Equations in One Variable",
            "Understanding Quadrilaterals", "Practical Geometry",
            "Data Handling", "Squares and Square Roots",
            "Cubes and Cube Roots", "Comparing Quantities",
            "Algebraic Expressions and Identities", "Visualising Solid Shapes",
            "Mensuration", "Exponents and Powers",
            "Direct and Inverse Proportions", "Factorisation",
            "Introduction to Graphs", "Playing with Numbers"
        ],
        "Science": [
            "Crop Production and Management", "Microorganisms: Friend and Foe",
            "Synthetic Fibres and Plastics", "Materials: Metals and Non-Metals",
            "Coal and Petroleum", "Combustion and Flame",
            "Conservation of Plants and Animals", "Cell — Structure and Functions",
            "Reproduction in Animals", "Reaching the Age of Adolescence",
            "Force and Pressure", "Friction", "Sound",
            "Chemical Effects of Electric Current", "Some Natural Phenomena",
            "Light", "Stars and the Solar System", "Pollution of Air and Water"
        ],
        "English": [
            "The Best Christmas Present in the World", "The Tsunami",
            "Glimpses of the Past", "Bepin Choudhury's Lapse of Memory",
            "The Summit Within", "This is Jody's Fawn",
            "A Visit to Cambridge", "A Short Monsoon Diary",
            "The Great Stone Face – I", "The Great Stone Face – II"
        ],
        "Hindi": [
            "ध्वनि", "लाख की चूड़ियाँ", "बस की यात्रा",
            "दीवानों की हस्ती", "चिट्ठियों की अनूठी दुनिया",
            "भगवान के डाकिए", "क्या निराश हुआ जाए", "यह सबसे कठिन समय नहीं",
            "कबीर की साखियाँ", "कामचोर", "जब सिनेमा ने बोलना सीखा",
            "सुदामा चरित", "जहाँ पहिया है", "अकबरी लोटा",
            "सूरदास के पद", "पानी की कहानी"
        ],
        "Social Science": [
            "How, When and Where", "From Trade to Territory",
            "Ruling the Countryside", "Tribals, Dikus and the Vision of a Golden Age",
            "When People Rebel 1857 and After", "Weavers, Iron Smelters and Factory Owners",
            "Civilising the 'Native', Educating the Nation",
            "Women, Caste and Reform", "The Making of the National Movement: 1870s-1947",
            "India After Independence", "The Indian Constitution",
            "Understanding Secularism", "Why Do We Need a Parliament?",
            "Understanding Laws", "Judiciary", "Understanding Our Criminal Justice System",
            "Understanding Marginalisation", "Confronting Marginalisation",
            "Resources", "Land, Soil, Water, Natural Vegetation and Wildlife Resources",
            "Mineral and Power Resources", "Agriculture", "Industries",
            "Human Resources"
        ],
        "Sanskrit": [
            "सुभाषितानि", "बिलस्य वाणी न कदापि मे श्रुता",
            "डिजीभारतम्", "सदैव पुरतो निधेहि चरणम्",
            "कण्टकेनैव कण्टकम्", "गृहं शून्यं सुतां विना",
            "भारतजनताऽहम्", "संसारसागरस्य नायकाः",
            "सप्तभगिन्यः", "नीतिनवनीतम्"
        ],
        "Computer Science": [
            "Advanced Python Programming", "Functions in Python",
            "Lists and Dictionaries", "Introduction to Databases",
            "Cyber Safety", "HTML and CSS",
            "Creating Web Pages", "Introduction to AI"
        ],
    },
    # ---- Class 9 ----
    9: {
        "Mathematics": [
            "Number Systems", "Polynomials", "Coordinate Geometry",
            "Linear Equations in Two Variables", "Introduction to Euclid's Geometry",
            "Lines and Angles", "Triangles", "Quadrilaterals",
            "Areas of Parallelograms and Triangles", "Circles",
            "Constructions", "Heron's Formula",
            "Surface Areas and Volumes", "Statistics", "Probability"
        ],
        "Science": [
            "Matter in Our Surroundings", "Is Matter Around Us Pure?",
            "Atoms and Molecules", "Structure of the Atom",
            "The Fundamental Unit of Life", "Tissues",
            "Diversity in Living Organisms", "Motion",
            "Force and Laws of Motion", "Gravitation",
            "Work and Energy", "Sound",
            "Why Do We Fall Ill?", "Natural Resources",
            "Improvement in Food Resources"
        ],
        "English": [
            "The Fun They Had", "The Sound of Music",
            "The Little Girl", "A Truly Beautiful Mind",
            "The Snake and the Mirror", "My Childhood",
            "Packing", "Reach for the Top",
            "The Bond of Love", "Kathmandu", "If I Were You"
        ],
        "Hindi": [
            "दो बैलों की कथा", "ल्हासा की ओर", "उपभोक्तावाद की संस्कृति",
            "साँवले सपनों की याद", "नाना साहब की पुत्री",
            "प्रेमचंद के फटे जूते", "मेरे बचपन के दिन",
            "एक कुत्ता और एक मैना", "साखी", "वाख",
            "सवैये", "कैदी और कोकिला", "ग्राम श्री",
            "चंद्र गहना से लौटती बेर"
        ],
        "Social Science": [
            "The French Revolution", "Socialism in Europe and the Russian Revolution",
            "Nazism and the Rise of Hitler", "Forest Society and Colonialism",
            "Pastoralists in the Modern World", "What is Democracy? Why Democracy?",
            "Constitutional Design", "Electoral Politics",
            "Working of Institutions", "Democratic Rights",
            "India — Size and Location", "Physical Features of India",
            "Drainage", "Climate", "Natural Vegetation and Wildlife",
            "Population", "The Story of Village Palampur",
            "People as Resource", "Poverty as a Challenge",
            "Food Security in India"
        ],
        "Computer Science": [
            "Computer System Overview", "Number System",
            "Introduction to Python", "Working with Lists and Strings",
            "Introduction to Problem Solving", "Getting Started with Python",
            "Flow of Control", "Functions", "Strings",
            "Lists", "Tuples", "Cyber Safety"
        ],
    },
    # ---- Class 10 ----
    10: {
        "Mathematics": [
            "Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables",
            "Quadratic Equations", "Arithmetic Progressions",
            "Triangles", "Coordinate Geometry", "Introduction to Trigonometry",
            "Some Applications of Trigonometry", "Circles",
            "Constructions", "Areas Related to Circles",
            "Surface Areas and Volumes", "Statistics", "Probability"
        ],
        "Science": [
            "Chemical Reactions and Equations", "Acids, Bases and Salts",
            "Metals and Non-metals", "Carbon and Its Compounds",
            "Periodic Classification of Elements", "Life Processes",
            "Control and Coordination", "How Do Organisms Reproduce?",
            "Heredity and Evolution", "Light — Reflection and Refraction",
            "Human Eye and Colourful World", "Electricity",
            "Magnetic Effects of Electric Current", "Sources of Energy",
            "Our Environment", "Management of Natural Resources"
        ],
        "English": [
            "A Letter to God", "Nelson Mandela: Long Walk to Freedom",
            "Two Stories about Flying", "From the Diary of Anne Frank",
            "The Hundred Dresses – I", "The Hundred Dresses – II",
            "Glimpses of India", "Mijbil the Otter",
            "Madam Rides the Bus", "The Sermon at Benares",
            "The Proposal"
        ],
        "Hindi": [
            "सूरदास के पद", "राम-लक्ष्मण-परशुराम संवाद",
            "आत्मत्राण", "उत्साह", "यह दंतुरित मुसकान",
            "फसल", "छाया मत छूना", "कन्यादान",
            "संगतकार", "नेताजी का चश्मा", "बालगोबिन भगत",
            "लखनवी अंदाज़", "मानवीय करुणा की दिव्या चमक",
            "एक कहानी यह भी", "स्त्री-शिक्षा के विरुद्ध कुप्रथाओं का खंडन",
            "नौबतखाने में इबादत", "संस्कृति"
        ],
        "Social Science": [
            "The Rise of Nationalism in Europe", "Nationalism in India",
            "The Making of a Global World", "The Age of Industrialisation",
            "Print Culture and the Modern World", "Power Sharing",
            "Federalism", "Democracy and Diversity",
            "Gender, Religion and Caste", "Popular Struggles and Movements",
            "Political Parties", "Outcomes of Democracy",
            "Challenges to Democracy", "Resources and Development",
            "Forest and Wildlife Resources", "Water Resources",
            "Agriculture", "Minerals and Energy Resources",
            "Manufacturing Industries", "Lifelines of National Economy",
            "Development", "Sectors of the Indian Economy",
            "Money and Credit", "Globalisation and the Indian Economy",
            "Consumer Rights"
        ],
        "Computer Science": [
            "Computer Networks", "Database Concepts",
            "SQL", "Introduction to Python Libraries",
            "Societal Impacts of IT", "Python Revision Tour",
            "Functions in Python", "Using Python Libraries",
            "Data Handling", "Computer Networks Basics"
        ],
    },
    # ---- Class 11 ----
    11: {
        "Mathematics": [
            "Sets", "Relations and Functions", "Trigonometric Functions",
            "Principle of Mathematical Induction", "Complex Numbers and Quadratic Equations",
            "Linear Inequalities", "Permutations and Combinations",
            "Binomial Theorem", "Sequences and Series",
            "Straight Lines", "Conic Sections",
            "Introduction to Three Dimensional Geometry",
            "Limits and Derivatives", "Mathematical Reasoning",
            "Statistics", "Probability"
        ],
        "Physics": [
            "Physical World", "Units and Measurements",
            "Motion in a Straight Line", "Motion in a Plane",
            "Laws of Motion", "Work, Energy and Power",
            "System of Particles and Rotational Motion", "Gravitation",
            "Mechanical Properties of Solids", "Mechanical Properties of Fluids",
            "Thermal Properties of Matter", "Thermodynamics",
            "Kinetic Theory", "Oscillations", "Waves"
        ],
        "Chemistry": [
            "Some Basic Concepts of Chemistry", "Structure of Atom",
            "Classification of Elements and Periodicity in Properties",
            "Chemical Bonding and Molecular Structure", "States of Matter",
            "Thermodynamics", "Equilibrium", "Redox Reactions",
            "Hydrogen", "The s-Block Elements", "The p-Block Elements",
            "Organic Chemistry – Some Basic Principles and Techniques",
            "Hydrocarbons", "Environmental Chemistry"
        ],
        "Biology": [
            "The Living World", "Biological Classification",
            "Plant Kingdom", "Animal Kingdom",
            "Morphology of Flowering Plants", "Anatomy of Flowering Plants",
            "Structural Organisation in Animals", "Cell: The Unit of Life",
            "Biomolecules", "Cell Cycle and Cell Division",
            "Transport in Plants", "Mineral Nutrition",
            "Photosynthesis in Higher Plants", "Respiration in Plants",
            "Plant Growth and Development", "Digestion and Absorption",
            "Breathing and Exchange of Gases", "Body Fluids and Circulation",
            "Excretory Products and Their Elimination",
            "Locomotion and Movement", "Neural Control and Coordination",
            "Chemical Coordination and Integration"
        ],
        "English": [
            "The Portrait of a Lady", "We're Not Afraid to Die",
            "Discovering Tut: the Saga Continues", "Landscape of the Soul",
            "The Ailing Planet: the Green Movement's Role",
            "The Browning Version", "The Adventure",
            "Silk Road", "A Photograph", "The Laburnum Top",
            "The Voice of the Rain", "Childhood", "Father to Son"
        ],
        "Computer Science": [
            "Computer System", "Encoding Schemes and Number System",
            "Emerging Trends", "Introduction to Problem Solving",
            "Getting Started with Python", "Flow of Control",
            "Functions", "Strings", "Lists", "Tuples and Dictionaries",
            "Societal Impacts", "Python Libraries"
        ],
        "Physical Education": [
            "Changing Trends and Career in Physical Education",
            "Olympic Value Education", "Physical Fitness, Wellness and Lifestyle",
            "Physical Education and Sports for CWSN",
            "Yoga", "Physical Activity and Leadership Training",
            "Test, Measurement and Evaluation",
            "Fundamentals of Anatomy, Physiology and Kinesiology",
            "Biomechanics and Sports", "Psychology and Sports"
        ],
    },
    # ---- Class 12 ----
    12: {
        "Mathematics": [
            "Relations and Functions", "Inverse Trigonometric Functions",
            "Matrices", "Determinants", "Continuity and Differentiability",
            "Application of Derivatives", "Integrals",
            "Application of Integrals", "Differential Equations",
            "Vector Algebra", "Three Dimensional Geometry",
            "Linear Programming", "Probability"
        ],
        "Physics": [
            "Electric Charges and Fields", "Electrostatic Potential and Capacitance",
            "Current Electricity", "Moving Charges and Magnetism",
            "Magnetism and Matter", "Electromagnetic Induction",
            "Alternating Current", "Electromagnetic Waves",
            "Ray Optics and Optical Instruments", "Wave Optics",
            "Dual Nature of Radiation and Matter", "Atoms",
            "Nuclei", "Semiconductor Electronics: Materials, Devices and Simple Circuits"
        ],
        "Chemistry": [
            "The Solid State", "Solutions",
            "Electrochemistry", "Chemical Kinetics",
            "Surface Chemistry", "General Principles and Processes of Isolation of Elements",
            "The p-Block Elements", "The d- and f-Block Elements",
            "Coordination Compounds", "Haloalkanes and Haloarenes",
            "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids",
            "Amines", "Biomolecules", "Polymers",
            "Chemistry in Everyday Life"
        ],
        "Biology": [
            "Reproduction in Organisms", "Sexual Reproduction in Flowering Plants",
            "Human Reproduction", "Reproductive Health",
            "Principles of Inheritance and Variation",
            "Molecular Basis of Inheritance", "Evolution",
            "Human Health and Disease", "Strategies for Enhancement in Food Production",
            "Microbes in Human Welfare", "Biotechnology: Principles and Processes",
            "Biotechnology and Its Applications",
            "Organisms and Populations", "Ecosystem",
            "Biodiversity and Conservation", "Environmental Issues"
        ],
        "English": [
            "The Last Lesson", "Lost Spring",
            "Deep Water", "The Rattrap",
            "Indigo", "Poets and Pancakes",
            "The Interview", "Going Places",
            "My Mother at Sixty-six", "An Elementary School Classroom in a Slum",
            "Keeping Quiet", "A Thing of Beauty",
            "Aunt Jennifer's Tigers", "The Third Level",
            "The Tiger King", "The Enemy", "On the Face of It",
            "Evans Tries an O-Level", "Memories of Childhood"
        ],
        "Computer Science": [
            "Python Revision Tour", "Functions/Functional Programming",
            "File Handling", "Exception Handling",
            "Data Structures: Stack and Queue", "Database Concepts",
            "SQL", "Computer Networks",
            "Communication Technologies", "Cyber Safety",
            "Python Libraries: NumPy, Pandas", "Data Visualization"
        ],
        "Physical Education": [
            "Planning in Sports", "Sports and Nutrition",
            "Yoga and Lifestyle", "Physical Education and Sports for CWSN",
            "Children and Women in Sports", "Test and Measurement in Sports",
            "Physiology and Injuries in Sports", "Biomechanics and Sports",
            "Psychology and Sports", "Training in Sports"
        ],
    },
}

# ==========================================
# ICSE Syllabus - Class 1 to 12
# ==========================================

ICSE_SUBJECTS = {
    # Class 1-5 (Primary)
    1: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    2: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    3: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    4: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    5: ["Mathematics", "English", "Hindi", "EVS", "Art", "Moral Science", "GK"],
    # Class 6-8 (Middle)
    6: ["Mathematics", "Science", "English", "Hindi", "History", "Geography", "Civics", "Computer Science"],
    7: ["Mathematics", "Science", "English", "Hindi", "History", "Geography", "Civics", "Computer Science"],
    8: ["Mathematics", "Science", "English", "Hindi", "History", "Geography", "Civics", "Computer Science"],
    # Class 9-10 (Secondary)
    9: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "History", "Geography", "Civics", "Computer Science"],
    10: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "History", "Geography", "Civics", "Computer Science"],
    # Class 11-12 (ISC)
    11: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "Physical Education"],
    12: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science", "Physical Education"],
}

# ICSE chapters (abbreviated — primary classes share structure with CBSE, higher classes have ICSE-specific chapters)
ICSE_CHAPTERS: dict[int, dict[str, list[str]]] = {
    # Class 1-5: Use same chapter structure as CBSE (primary level is similar)
    # Class 6
    6: {
        "Mathematics": [
            "Number System", "Estimation", "Numbers in Indian and International System",
            "HCF and LCM", "Fractions", "Decimals", "Integers",
            "Ratio and Proportion", "Algebra", "Linear Equations",
            "Mensuration", "Data Handling", "Symmetry", "Practical Geometry"
        ],
        "Science": [
            "Plant Life", "Animal Life", "Chemistry in Daily Life",
            "Matter and Its Composition", "Physical and Chemical Changes",
            "Living and Non-living Things", "Cell — The Building Block of Life",
            "Habitat and Adaptation", "Measurement and Motion",
            "Force, Work and Energy", "Light and Sound",
            "Magnetism and Electricity", "Air and Water", "Waste Management"
        ],
        "English": [
            "Prose — Comprehensive Reading", "Poetry Appreciation",
            "Short Stories", "Grammar — Tenses", "Grammar — Parts of Speech",
            "Letter Writing", "Essay Writing", "Comprehension Passages",
            "Creative Writing", "Vocabulary Building"
        ],
        "Hindi": [
            "गद्य पाठ", "पद्य पाठ", "व्याकरण — संज्ञा",
            "व्याकरण — सर्वनाम", "व्याकरण — क्रिया",
            "पत्र लेखन", "निबंध लेखन", "अपठित गद्यांश"
        ],
        "History": [
            "The River Valley Civilizations", "The Vedic Period",
            "Buddhism and Jainism", "The Maurya Empire",
            "The Gupta Empire", "Ancient Indian Culture"
        ],
        "Geography": [
            "The Earth and the Solar System", "Latitudes and Longitudes",
            "Rotation and Revolution", "Maps — Types and Components",
            "Landforms of the Earth", "India — Physical Features"
        ],
        "Civics": [
            "Our Government", "Rural and Urban Administration",
            "Panchayati Raj", "Our Fundamental Rights",
            "Diversity in India"
        ],
        "Computer Science": [
            "Introduction to Computers", "Operating Systems",
            "Word Processing", "Spreadsheets",
            "Internet Basics", "Introduction to Coding",
            "Scratch Programming", "Digital Safety"
        ],
    },
    # Class 7
    7: {
        "Mathematics": [
            "Integers", "Fractions and Decimals", "Exponents",
            "Algebraic Expressions", "Simple Linear Equations",
            "Ratio and Proportion", "Unitary Method", "Percentage",
            "Profit and Loss", "Lines and Angles", "Triangles",
            "Congruence", "Perimeter and Area", "Data Handling"
        ],
        "Science": [
            "Tissue and Organ Systems", "Classification of Plants",
            "Classification of Animals", "Physical and Chemical Changes",
            "Acids, Bases and Salts", "Fibre and Fabric",
            "Motion and Time", "Heat and Temperature",
            "Light", "Sound", "Electric Circuits",
            "Weather and Climate", "Water and Its Properties", "Soil"
        ],
        "English": [
            "Prose Studies", "Poetry Analysis", "Drama",
            "Grammar — Tenses Advanced", "Grammar — Voice",
            "Formal Letter Writing", "Informal Letter Writing",
            "Essay Writing", "Story Writing", "Comprehension"
        ],
        "Hindi": [
            "गद्य खंड", "पद्य खंड", "व्याकरण — विशेषण",
            "व्याकरण — क्रिया विशेषण", "व्याकरण — वाक्य रचना",
            "अनुच्छेद लेखन", "संवाद लेखन", "चित्र वर्णन"
        ],
        "History": [
            "Medieval India — Delhi Sultanate", "The Mughal Empire",
            "Bhakti and Sufi Movements", "Medieval Architecture",
            "Rise of Regional Kingdoms", "Life in Medieval India"
        ],
        "Geography": [
            "Atmosphere and Weather", "Water — Oceans and Rivers",
            "Natural Vegetation and Wildlife", "Human Environment",
            "Life in Tropical Regions", "Life in Deserts",
            "Life in Temperate Grasslands"
        ],
        "Civics": [
            "The Indian Constitution", "Fundamental Rights and Duties",
            "The Legislature", "The Executive",
            "The Judiciary", "State Government"
        ],
        "Computer Science": [
            "Advanced Word Processing", "Spreadsheet Functions",
            "Presentation Software", "Internet Research",
            "Introduction to Python", "Variables and Operators",
            "Conditional Statements", "Loops"
        ],
    },
    # Class 8
    8: {
        "Mathematics": [
            "Rational Numbers", "Exponents and Powers",
            "Squares and Square Roots", "Cubes and Cube Roots",
            "Playing with Numbers", "Sets", "Percentage and Its Applications",
            "Profit, Loss and Discount", "Interest",
            "Algebraic Expressions and Identities", "Factorization",
            "Linear Equations", "Understanding Quadrilaterals",
            "Constructions", "Mensuration", "Data Handling"
        ],
        "Science": [
            "Transport of Food and Minerals in Plants", "Reproduction in Plants and Animals",
            "Adolescence", "Metals and Non-metals",
            "Atomic Structure", "Chemical Reactions",
            "Acids, Bases and Salts", "Force and Pressure",
            "Friction", "Sound", "Light — Reflection",
            "Electricity", "Solar System", "Pollution"
        ],
        "English": [
            "Prose — Detailed Study", "Poetry — Detailed Study",
            "Drama", "Grammar — Clauses", "Grammar — Reported Speech",
            "Formal and Informal Letters", "Argumentative Essay",
            "Descriptive Writing", "Narrative Writing", "Notice and Email Writing"
        ],
        "Hindi": [
            "गद्य — विस्तृत अध्ययन", "पद्य — विस्तृत अध्ययन",
            "व्याकरण — समास", "व्याकरण — उपसर्ग-प्रत्यय",
            "व्याकरण — मुहावरे-लोकोक्तियाँ", "औपचारिक पत्र",
            "अनौपचारिक पत्र", "लघु कथा लेखन"
        ],
        "History": [
            "The Modern Period in India", "British Rule in India",
            "Indian National Movement", "World War I",
            "World War II", "The United Nations",
            "Post-Independence India"
        ],
        "Geography": [
            "Population", "Migration", "Urbanization",
            "Agriculture", "Industries", "Transport and Communication",
            "Natural Resources", "Disaster Management"
        ],
        "Civics": [
            "The Indian Parliament", "The Union Executive",
            "The Judiciary", "Social Justice",
            "Human Rights", "The United Nations"
        ],
        "Computer Science": [
            "Python Fundamentals", "Data Types and Operators",
            "Strings in Python", "Lists and Tuples",
            "Functions", "HTML Basics",
            "CSS Styling", "Cyber Security"
        ],
    },
    # Class 9
    9: {
        "Mathematics": [
            "Rational and Irrational Numbers", "Compound Interest",
            "Expansions", "Factorisation", "Simultaneous Linear Equations",
            "Indices", "Logarithms", "Triangles",
            "Mid-Point and Intercept Theorems", "Pythagoras Theorem",
            "Rectilinear Figures", "Area and Perimeter of Plane Figures",
            "Circle", "Statistics", "Mean and Median",
            "Area and Volume of Solids", "Trigonometric Ratios",
            "Co-ordinate Geometry"
        ],
        "Physics": [
            "Measurements and Experimentation", "Motion in One Dimension",
            "Laws of Motion", "Pressure in Fluids and Atmospheric Pressure",
            "Upthrust in Fluids, Archimedes' Principle and Floatation",
            "Heat and Energy", "Reflection of Light",
            "Sound", "Current Electricity", "Magnetism"
        ],
        "Chemistry": [
            "The Language of Chemistry", "Chemical Changes and Reactions",
            "Water", "Atomic Structure and Chemical Bonding",
            "The Periodic Table", "Study of the First Element — Hydrogen",
            "Study of Gas Laws", "Atmospheric Pollution"
        ],
        "Biology": [
            "Basic Biology", "Cell: The Unit of Life",
            "Tissues", "The Flower", "Pollination and Fertilization",
            "Seeds — Structure and Germination", "Respiration in Plants",
            "Five Kingdom Classification", "Economic Importance of Bacteria and Fungi",
            "Nutrition", "Digestive System", "Skeleton — Movement and Locomotion",
            "The Skin — The Jack of All Trades", "The Respiratory System",
            "Health and Hygiene — Diseases and their Prevention"
        ],
        "English": [
            "Prose — Treasure Trove", "Poetry — Treasure Trove",
            "Drama — Merchant of Venice", "Grammar — Transformation",
            "Grammar — Direct and Indirect Speech",
            "Letter Writing", "Essay Writing", "Comprehension",
            "Short Stories", "Composition"
        ],
        "Hindi": [
            "गद्य संकलन", "पद्य संकलन", "व्याकरण — रस",
            "व्याकरण — अलंकार", "व्याकरण — छंद",
            "निबंध", "पत्र लेखन", "अपठित बोध"
        ],
        "History": [
            "The Harappan Civilization", "The Vedic Period",
            "Developments in Medicine, Education and Astronomy",
            "The Mauryan Empire", "The Age of the Guptas",
            "The Arab Invasion — Medieval India",
            "The Vijayanagar and Bahmani Kingdoms",
            "The Mughal Empire"
        ],
        "Geography": [
            "Our World", "Geographic Grid: Latitudes and Longitudes",
            "Map Work", "Earth's Structure",
            "Volcanism and Earthquakes", "Weathering and Soil Formation",
            "River", "Climate", "Natural Regions of the World"
        ],
        "Civics": [
            "Our Constitution", "Fundamental Rights, Fundamental Duties and Directive Principles",
            "Elections", "Local Self Government",
            "The Union Legislature — Parliament",
            "The Union Executive", "The Judiciary"
        ],
        "Computer Science": [
            "Introduction to Object Oriented Programming",
            "Elementary Concepts of Objects and Classes",
            "Values and Data Types", "Operators in Java",
            "Input in Java", "Conditional Constructs",
            "Iterative Constructs", "Nested Loops",
            "Introduction to Arrays", "String Handling"
        ],
    },
    # Class 10
    10: {
        "Mathematics": [
            "Goods and Services Tax", "Banking",
            "Shares and Dividends", "Linear Inequations",
            "Quadratic Equations", "Ratio and Proportion",
            "Factorisation of Polynomials", "Matrices",
            "Arithmetic Progression", "Geometric Progression",
            "Co-ordinate Geometry", "Similarity",
            "Loci", "Circles", "Constructions",
            "Mensuration", "Trigonometry", "Statistics",
            "Probability"
        ],
        "Physics": [
            "Force", "Work, Energy and Power",
            "Machines", "Refraction of Light at Plane Surfaces",
            "Refraction through a Lens", "Spectrum",
            "Sound", "Current Electricity", "Household Circuits",
            "Electro-magnetism", "Calorimetry", "Radioactivity"
        ],
        "Chemistry": [
            "Periodic Table, Periodic Properties and Variations",
            "Chemical Bonding", "Acids, Bases and Salts",
            "Analytical Chemistry", "Mole Concept and Stoichiometry",
            "Electrolysis", "Metallurgy",
            "Study of Compounds — Hydrogen Chloride",
            "Study of Compounds — Ammonia",
            "Study of Compounds — Nitric Acid",
            "Study of Compounds — Sulphuric Acid",
            "Organic Chemistry"
        ],
        "Biology": [
            "Cell Cycle, Cell Division and Structure of Chromosomes",
            "Genetics — Some Basic Fundamentals",
            "Absorption by Roots", "Transpiration",
            "Photosynthesis", "Chemical Coordination in Plants",
            "The Circulatory System", "The Excretory System",
            "The Nervous System and Sense Organs",
            "The Endocrine System", "The Reproductive System",
            "Population — The Increasing Numbers and Rising Problems",
            "HIV/AIDS", "Pollution — A Rising Environmental Problem"
        ],
        "English": [
            "Prose — Treasure Trove", "Poetry — Treasure Trove",
            "Drama — Merchant of Venice", "Grammar — Sentence Transformation",
            "Grammar — Phrasal Verbs and Idioms",
            "Formal Letter", "Argumentative/Discursive Essay",
            "Short Story Writing", "Comprehension",
            "Notice, Email, Report Writing"
        ],
        "Hindi": [
            "गद्य संकलन", "पद्य संकलन", "नाटक",
            "व्याकरण — समास", "व्याकरण — अलंकार",
            "निबंध लेखन", "पत्र लेखन", "अपठित गद्यांश"
        ],
        "History": [
            "The First War of Independence 1857",
            "Growth of Nationalism", "First Phase of Indian National Movement",
            "Second Phase of Indian National Movement",
            "Struggle for Freedom", "The World Wars",
            "Rise of Dictatorships", "The United Nations"
        ],
        "Geography": [
            "Map Study", "Climate of India",
            "Soils of India", "Natural Vegetation of India",
            "Water Resources of India", "Mineral and Energy Resources",
            "Agriculture in India", "Manufacturing Industries",
            "Transport", "Waste Management"
        ],
        "Civics": [
            "The Union Legislature", "The Union Executive",
            "The Judiciary", "Fundamental Rights and Duties",
            "Directive Principles of State Policy"
        ],
        "Computer Science": [
            "Revision of Class IX Syllabus", "Class as a User-Defined Type",
            "User-Defined Methods", "Constructors",
            "Library Classes", "Encapsulation",
            "Arrays — Single Dimensional", "String Methods",
            "Iterative Techniques in Programming", "Nested Loops and Programs"
        ],
    },
    # Class 11-12: ISC uses similar subjects to CBSE for Science stream
    # Share CBSE chapters for these
}


def get_subject_key(subject_name: str) -> str:
    """Subject name to key mapping for colors/icons"""
    mapping = {
        "mathematics": "math", "math": "math",
        "science": "science",
        "english": "english",
        "hindi": "hindi",
        "social science": "social_science",
        "history": "history",
        "geography": "geography",
        "civics": "civics",
        "economics": "economics",
        "physics": "physics",
        "chemistry": "chemistry",
        "biology": "biology",
        "computer science": "computer_science",
        "evs": "evs",
        "art": "art",
        "moral science": "moral_science",
        "gk": "gk",
        "sanskrit": "sanskrit",
        "physical education": "physical_education",
        "business studies": "business_studies",
        "accountancy": "accountancy",
        "political science": "political_science",
        "sociology": "sociology",
        "psychology": "psychology",
        "home science": "home_science",
        "informatics practices": "informatics_practices",
    }
    return mapping.get(subject_name.lower(), "math")


def build_courses_and_chapters(board: str, subjects_map: dict, chapters_map: dict) -> tuple[list[dict], list[dict]]:
    """Build course and chapter documents for a board"""
    courses = []
    chapters = []
    now = datetime.now(timezone.utc).isoformat()

    for grade, subjects in subjects_map.items():
        for subject in subjects:
            key = get_subject_key(subject)
            course_doc = {
                "title": f"{subject} — Class {grade}",
                "subject": subject.lower(),
                "grade": grade,
                "board": board.upper(),
                "icon": ICONS.get(key, "📚"),
                "color": COLORS.get(key, "from-violet-500 to-purple-600"),
                "description": f"{board} Class {grade} {subject} complete syllabus with chapters",
                "created_at": now,
                "updated_at": now,
            }
            courses.append(course_doc)

            # Get chapters for this class/subject
            class_chapters = chapters_map.get(grade, {})
            subject_chapters = class_chapters.get(subject, [])

            # For classes not in chapters_map (like ICSE 1-5), use CBSE chapters
            if not subject_chapters and board == "ICSE" and grade <= 5:
                subject_chapters = CBSE_CHAPTERS.get(grade, {}).get(subject, [])

            # For ICSE 11-12, use CBSE chapters
            if not subject_chapters and board == "ICSE" and grade >= 11:
                subject_chapters = CBSE_CHAPTERS.get(grade, {}).get(subject, [])

            for i, ch_title in enumerate(subject_chapters, 1):
                chapters.append({
                    "_course_key": f"{board}_{grade}_{subject}",
                    "title": ch_title,
                    "content": f"Chapter {i}: {ch_title}",
                    "video_url": "",
                    "order": i,
                    "created_at": now,
                })

    return courses, chapters


async def seed():
    """Main seed function"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    courses_coll = db["courses"]
    chapters_coll = db["chapters"]

    # Check existing courses
    existing_count = await courses_coll.count_documents({})
    print(f"Existing courses in database: {existing_count}")

    # Build all courses and chapters
    cbse_courses, cbse_chapters = build_courses_and_chapters("CBSE", CBSE_SUBJECTS, CBSE_CHAPTERS)
    icse_courses, icse_chapters = build_courses_and_chapters("ICSE", ICSE_SUBJECTS, ICSE_CHAPTERS)

    all_courses = cbse_courses + icse_courses
    all_chapters = cbse_chapters + icse_chapters

    print(f"\nTotal courses to add: {len(all_courses)}")
    print(f"  CBSE: {len(cbse_courses)} courses")
    print(f"  ICSE: {len(icse_courses)} courses")
    print(f"Total chapters to add: {len(all_chapters)}")

    # Delete existing courses and chapters to avoid duplicates
    if existing_count > 0:
        print("\nDeleting existing courses and chapters...")
        await courses_coll.delete_many({})
        await chapters_coll.delete_many({})
        print("Existing data cleared.")

    # Insert courses
    print("\nInserting courses...")
    result = await courses_coll.insert_many(all_courses)
    print(f"Inserted {len(result.inserted_ids)} courses.")

    # Build course_id mapping
    course_id_map = {}
    for i, course in enumerate(all_courses):
        key = f"{course['board']}_{course['grade']}_{course['subject'].title()}"
        # Handle multi-word subjects
        for subj_name in CBSE_SUBJECTS.get(course['grade'], []) + ICSE_SUBJECTS.get(course['grade'], []):
            test_key = f"{course['board']}_{course['grade']}_{subj_name}"
            if test_key not in course_id_map:
                if course['subject'] == subj_name.lower():
                    course_id_map[test_key] = str(result.inserted_ids[i])

    # Assign course_ids to chapters
    chapters_to_insert = []
    for ch in all_chapters:
        course_key = ch.pop("_course_key")
        course_id = course_id_map.get(course_key)
        if course_id:
            ch["course_id"] = course_id
            chapters_to_insert.append(ch)

    # Insert chapters
    if chapters_to_insert:
        print(f"\nInserting {len(chapters_to_insert)} chapters...")
        ch_result = await chapters_coll.insert_many(chapters_to_insert)
        print(f"Inserted {len(ch_result.inserted_ids)} chapters.")
    else:
        print("\nNo chapters to insert (course_id mapping issue).")

    # Print summary
    print("\n" + "=" * 50)
    print("SEED COMPLETE!")
    print("=" * 50)

    # Count per board per grade
    for board in ["CBSE", "ICSE"]:
        count = await courses_coll.count_documents({"board": board})
        print(f"\n{board}: {count} courses total")
        for grade in range(1, 13):
            g_count = await courses_coll.count_documents({"board": board, "grade": grade})
            if g_count > 0:
                print(f"  Class {grade}: {g_count} subjects")

    total_chapters = await chapters_coll.count_documents({})
    print(f"\nTotal chapters in database: {total_chapters}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
