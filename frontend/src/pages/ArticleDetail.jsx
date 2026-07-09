import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const ArticleDetail = () => {
  const { id } = useParams();
  const { lang, t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [trending, setTrending] = useState([]);

  // Form states
  const [commentor, setCommentor] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const allFallbackArticles = [
    {
      id: 'demo-1',
      titleTa: "தமிழக சட்டமன்றக் கூட்டத்தொடர் புதிய பட்ஜெட் அறிவிப்புகள் – நேரடித் தகவல்கள்",
      titleEn: "TN assembly budget session new announcements - live reports",
      descTa: "பட்ஜெட் கூட்டத்தொடரில் முக்கிய துறைகளுக்கான நிதி ஒதுக்கீடுகள் மற்றும் புதிய திட்டங்கள் குறித்த தகவல்கள் வெளியிடப்பட்டன.",
      descEn: "Important budget allocations and welfare schemes announced during the state assembly session.",
      contentTa: "தமிழக அரசின் 2026 பட்ஜெட் கூட்டத்தொடரில் பல முக்கிய அறிவிப்புகள் வெளியிடப்பட்டுள்ளன. குறிப்பாக, கல்வி, விவசாயம் மற்றும் உள்கட்டமைப்பு மேம்பாட்டிற்கு இந்த பட்ஜெட்டில் முக்கியத்துவம் அளிக்கப்பட்டுள்ளது. முதலமைச்சர் சட்டப்பேரவையில் இன்று ஆற்றிய உரையில், ஏழை எளிய மக்களின் வாழ்வாதாரத்தை மேம்படுத்தும் பல புதிய திட்டங்களை அறிவித்தார். அமைச்சர் நிதி ஒதுக்கீடு குறித்துப் பேசுகையில், 'மாநிலத்தின் நிதிநிலையைக் கருத்தில் கொண்டு, அதே சமயம் மக்கள் நலத் திட்டங்கள் முடங்கிவிடாமல் இருக்க தகுந்த நடவடிக்கைகள் எடுக்கப்பட்டுள்ளன. அடுத்த சில மாதங்களில் இந்த திட்டங்கள் அனைத்தும் செயல்பாட்டிற்கு வரும்' என்றார்.",
      contentEn: "The state budget session for 2026 announced key welfare parameters. Specifically, sectors like primary education, agriculture and highway infrastructure development received major budget boosts. The Chief Minister addressed the assembly highlights and detailed the next path of investments. The Finance Minister noted that although constraints remain, no public schemes are suspended.",
      authorName: "கே. செல்வக்குமார்",
      authorRole: "தலைமைச் செய்தி நிருபர்",
      pubDate: "20 மே 2025 | 10:30 AM",
      readTime: "3 நிமிட வாசிப்பு",
      readTimeEn: "3 Min Read",
      categoryName: "அரசியல்",
      categoryNameEn: "Politics",
      categorySlug: "politics",
      tags: ["சட்டமன்றம்", "தமிழக பட்ஜெட்", "அரசு கொள்கை"],
      gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)"
    },
    {
      id: 'demo-2',
      titleTa: "இந்திய கிரிக்கெட் அணி ஆஸ்திரேலியாவை வீழ்த்தியது - 3-0 அபாரம்",
      titleEn: "Indian cricket team beats Australia 3-0 in T20 series",
      descTa: "ஆஸ்திரேலியாவுக்கு எதிரான டி20 தொடரை 3-0 என்ற கணக்கில் இந்திய அணி முழுமையாக வென்றது. விராட் கோலி அபார ஆட்டம்.",
      descEn: "India clean sweeps T20 series against Australia 3-0. Virat Kohli shines with a brilliant match-winning performance.",
      contentTa: "ஆஸ்திரேலியாவுக்கு எதிரான டி20 தொடரில் இந்திய அணி அபாரமாக விளையாடி 3-0 என்ற கணக்கில் தொடரை வென்றுள்ளது. கடைசி போட்டியில் இந்திய பேட்ஸ்மேன்கள் அதிரடியாக விளையாடி ரன்களை குவித்தனர். விராட் கோலியின் சிறப்பான ஆட்டம் மற்றும் பந்துவீச்சாளர்களின் துல்லியமான பந்துவீச்சு வெற்றிக்கு வழிவகுத்தது. ரசிகர்கள் மற்றும் விளையாட்டு வீரர்கள் இந்த வரலாற்று வெற்றியை கொண்டாடி வருகின்றனர்.",
      contentEn: "In the recently concluded T20 series against Australia, Indian cricket team showcased exemplary class to register a 3-0 clean sweep. In the final match, batsmen and bowlers put up a comprehensive team effort. Kohli was awarded player of the series for his masterclass performance.",
      authorName: "எம். ராஜேஷ்",
      authorRole: "விளையாட்டு நிருபர்",
      pubDate: "22 மே 2025 | 08:30 PM",
      readTime: "2 நிமிட வாசிப்பு",
      readTimeEn: "2 Min Read",
      categoryName: "விளையாட்டு",
      categoryNameEn: "Sports",
      categorySlug: "sports",
      tags: ["கிரிக்கெட்", "இந்தியா", "ஆஸ்திரேலியா"],
      gradient: "linear-gradient(135deg, #F97316, #FB923C)"
    },
    {
      id: 'demo-3',
      titleTa: "பங்குச் சந்தை புதிய உச்சம் - முதலீட்டாளர்களுக்கு வார இறுதி பரிசு",
      titleEn: "Share market reaches new peak - weekend gift for investors",
      descTa: "சென்செக்ஸ் 82,000 புள்ளிகளை தாண்டி புதிய சாதனை படைத்தது. ஐடி, பேங்கிங் பங்குகள் முன்னணி.",
      descEn: "Sensex creates new record by crossing 82,000 points. IT and Banking sectors lead the gainers list.",
      contentTa: "இந்திய பங்குச் சந்தை இன்று வரலாறு காணாத புதிய உச்சத்தை தொட்டுள்ளது. சென்செக்ஸ் 82,000 புள்ளிகளை தாண்டி சாதனை படைத்துள்ளது. முக்கிய தகவல் தொழில்நுட்ப நிறுவனங்கள் மற்றும் வங்கி பங்குகளின் மதிப்பு கணிசமாக உயர்ந்ததே இதற்கு காரணமாகும். பொருளாதார வளர்ச்சி மற்றும் நிலையான அரசு கொள்கைகள் முதலீட்டாளர்களிடையே நம்பிக்கையை அதிகரித்துள்ளது.",
      contentEn: "Indian benchmarks registered record high closures today. The Sensex benchmark scaled past 82,000 index values for the first time in history. Strong corporate earnings, foreign institutional buying and positive domestic macro numbers fueled this massive market rally.",
      authorName: "எஸ். ரமேஷ்",
      authorRole: "வணிக நிருபர்",
      pubDate: "21 மே 2025 | 04:15 PM",
      readTime: "3 நிமிட வாசிப்பு",
      readTimeEn: "3 Min Read",
      categoryName: "வணிகம்",
      categoryNameEn: "Business",
      categorySlug: "business",
      tags: ["பங்குச்சந்தை", "முதலீடு", "பொருளாதாரம்"],
      gradient: "linear-gradient(135deg, #065F46, #10B981)"
    },
    {
      id: 'demo-4',
      titleTa: "செயற்கை நுண்ணறிவில் தமிழக இளைஞர்கள் சாதனை - சர்வதேச அங்கீகாரம்",
      titleEn: "Tamil Nadu youth excel in AI research - receive international awards",
      descTa: "செயற்கை நுண்ணறிவில் தமிழக இளைஞர்கள் செய்த புதிய கண்டுபிடிப்புகளுக்கு சர்வதேச அறிவியல் சபை விருது வழங்கி கௌரவித்துள்ளது.",
      descEn: "International science council honors youth from Tamil Nadu for their ground-breaking developments in AI.",
      contentTa: "செயற்கை நுண்ணறிவு (AI) துறையில் தமிழ்நாட்டைச் சேர்ந்த இளம் ஆராய்ச்சியாளர்கள் புதிய சாதனைகளைப் புரிந்துள்ளனர். மருத்துவத் துறையில் நோய்களைக் கண்டறியும் புதிய AI மென்பொருளை அவர்கள் உருவாக்கியுள்ளனர். இதற்காக சர்வதேச அளவில் உயரிய விருது மற்றும் அங்கீகாரங்களை அவர்கள் பெற்றுள்ளனர். இவர்களின் சாதனையை முதல்வர் மற்றும் கல்வி அமைச்சர்கள் பாராட்டியுள்ளனர்.",
      contentEn: "Young software developers and academic researchers from Tamil Nadu have achieved global honors for their AI models. The team created a diagnostic software capable of predicting health metrics using computer vision. They received the prestigious International Tech Excellence award in Silicon Valley.",
      authorName: "ஏ. கவிதா",
      authorRole: "தொழில்நுட்ப செய்தியாளர்",
      pubDate: "20 மே 2025 | 11:45 AM",
      readTime: "4 நிமிட வாசிப்பு",
      readTimeEn: "4 Min Read",
      categoryName: "தொழில்நுட்பம்",
      categoryNameEn: "Tech",
      categorySlug: "tech",
      tags: ["செயற்கை நுண்ணறிவு", "தொழில்நுட்பம்", "ஆராய்ச்சி"],
      gradient: "linear-gradient(135deg, #6D28D9, #A855F7)"
    },
    {
      id: 'demo-5',
      titleTa: "தளபதி விஜய்யின் அடுத்த படம் குறித்த முக்கிய அறிவிப்பு வெளியானது",
      titleEn: "Major update released on Thalapathy Vijay's upcoming movie",
      descTa: "இயக்குனர் வெங்கட் பிரபு இயக்கத்தில் விஜய் நடிக்கும் 69-வது படம் குறித்த அதிகாரப்பூர்வ தகவல் வெளியாகியுள்ளது.",
      descEn: "Official details and title launch info released for Vijay's 69th film directed by Venkat Prabhu.",
      contentTa: "நடிகர் விஜய்யின் 69-வது திரைப்படம் குறித்த அதிகாரப்பூர்வ அறிவிப்பு வெளியாகியுள்ளது. வெங்கட் பிரபு இயக்கத்தில் உருவாகும் இந்த படத்திற்கு அனிருத் இசையமைக்கிறார். இந்த படத்தின் पूजा மற்றும் படப்பிடிப்பு பணிகள் விரைவில் தொடங்க உள்ளதாக தயாரிப்பு நிறுவனம் அறிவித்துள்ளது. ரசிகர்கள் இத்தகவலை சமூக வலைதளங்களில் வைரலாக்கி வருகின்றனர்.",
      contentEn: "The highly anticipated cinematic team collaborates again for Thalapathy Vijay's final project. Venkat Prabhu is set to direct the movie and Anirudh Ravichander is confirmed to compose the music scores. The production house confirmed that the shooting schedule begins next month.",
      authorName: "கே. சூர்யா",
      authorRole: "சினிமா நிருபர்",
      pubDate: "19 மே 2025 | 06:30 PM",
      readTime: "2 நிமிட வாசிப்பு",
      readTimeEn: "2 Min Read",
      categoryName: "பொழுதுபோக்கு",
      categoryNameEn: "Cinema",
      categorySlug: "cinema",
      tags: ["விஜய் 69", "சினிமா", "பொழுதுபோக்கு"],
      gradient: "linear-gradient(135deg, #BE185D, #EC4899)"
    },
    {
      id: 'demo-6',
      titleTa: "நெல் கொள்முதல் விலை உயர்வு - விவசாயிகள் சங்கம் வரவேற்பு",
      titleEn: "Paddy procurement price increased - farmers association welcomes move",
      descTa: "நெல்லுக்கான குறைந்தபட்ச ஆதரவு விலையை மத்திய அரசு உயர்த்தியுள்ள நிலையில் விவசாயிகள் மகிழ்ச்சி தெரிவித்துள்ளனர்.",
      descEn: "Farmers express joy as central government increases the minimum support price (MSP) for paddy procurement.",
      contentTa: "விவசாயிகளின் நீண்ட நாள் கோரிக்கையை ஏற்று நெல்லுக்கான குறைந்தபட்ச ஆதரவு விலையை அரசு உயர்த்தியுள்ளது. இந்த கொள்முதல் விலை உயர்வு தங்களின் வாழ்வாதாரத்தை உயர்த்த உதவும் என்று விவசாயிகள் சங்கம் மகிழ்ச்சி தெரிவித்துள்ளது. இந்த விலையேற்றம் நடப்பு சம்பா பருவ நெல் கொள்முதல் முதல் அமலுக்கு வருகிறது.",
      contentEn: "The union cabinet has announced a substantial increase in the Minimum Support Price (MSP) for paddy procurement for the current season. Agricultural associations and local farmers groups have welcomed the decision, stating that it will mitigate rising input costs.",
      authorName: "ஆர். பழனிச்சாமி",
      authorRole: "விவசாய செய்தியாளர்",
      pubDate: "20 மே 2025 | 07:15 AM",
      readTime: "3 நிமிட வாசிப்பு",
      readTimeEn: "3 Min Read",
      categoryName: "விவசாயம்",
      categoryNameEn: "Agriculture",
      categorySlug: "agri",
      tags: ["விவசாயம்", "நெல் கொள்முதல்", "விவசாயிகள்"],
      gradient: "linear-gradient(135deg, #16A34A, #4ADE80)"
    },
    {
      id: 'demo-7',
      titleTa: "பங்குச்சந்தை வரலாறு காணாத உயர்வு – சென்செக்ஸ் 83,000 புள்ளிகளைத் தாண்டியது",
      titleEn: "Stock markets reach record highs - Sensex crosses 83,000 points",
      descTa: "தொழில்நுட்ப மற்றும் வங்கி பங்குகள் பெரும் லாபம் ஈட்டியதை அடுத்து முதலீட்டாளர்கள் மகிழ்ச்சி அடைந்துள்ளனர்.",
      descEn: "Tech and Banking sector shares register major gains as domestic markets hit new historic milestones.",
      contentTa: "பங்குச்சந்தை இன்று வரலாறு காணாத புதிய சாதனையை எட்டியுள்ளது. சென்செக்ஸ் 83,000 புள்ளிகளுக்கு மேல் உயர்ந்துள்ளது. உலகளாவிய நேர்மறை போக்கு மற்றும் உள்நாட்டு முதலீடுகளின் வலுவான அதிகரிப்பு இதற்கு துணை புரிந்தது.",
      contentEn: "Benchmark stock indices recorded outstanding achievements today, with Sensex scaling past 83,000 milestone levels. Solid performances in financial sector drove the bull run.",
      authorName: "எஸ். ரமேஷ்",
      authorRole: "வணிக நிருபர்",
      pubDate: "21 மே 2025 | 09:30 AM",
      readTime: "2 நிமிட வாசிப்பு",
      readTimeEn: "2 Min Read",
      categoryName: "வணிகம்",
      categoryNameEn: "Business",
      categorySlug: "business",
      tags: ["பங்குச்சந்தை", "வளச்சி", "பொருளாதாரம்"],
      gradient: "linear-gradient(135deg, #065F46, #10B981)"
    },
    {
      id: 'demo-8',
      titleTa: "டாடா மோட்டார்ஸ் மின்சார வாகன உற்பத்தியில் புதிய முதலீடுகள்",
      titleEn: "Tata Motors announces fresh investments in EV manufacturing",
      descTa: "வாகன சந்தையில் எலெக்ட்ரிக் கார்களின் தேவையை பூர்த்தி செய்ய புதிய தொழிற்சாலைகள் அமைக்கப்பட உள்ளன.",
      descEn: "Automaker plans new manufacturing lines to cater to expanding customer demand in electric vehicles.",
      contentTa: "எலக்ட்ரிக் வாகன பிரிவில் தனது சந்தை ஆதிக்கத்தை வலுப்படுத்த டாடா மோட்டார்ஸ் புதிய முதலீடுகளை அறிவித்துள்ளது. இதனால் ஆயிரக்கணக்கான இளைஞர்களுக்கு வேலைவாய்ப்பு கிடைக்கும்.",
      contentEn: "Tata Motors has declared multi-million dollar investments into expanding clean mobility options. The new facility in South India will specialize in EV batteries.",
      authorName: "எஸ். ரமேஷ்",
      authorRole: "வணிக நிருபர்",
      pubDate: "21 மே 2025 | 11:30 AM",
      readTime: "3 நிமிட வாசிப்பு",
      readTimeEn: "3 Min Read",
      categoryName: "வணிகம்",
      categoryNameEn: "Business",
      categorySlug: "business",
      tags: ["டாடா", "மின்சார வாகனம்", "முதலீடு"],
      gradient: "linear-gradient(135deg, #10B981, #34D399)"
    },
    {
      id: 'demo-9',
      titleTa: "தங்கத்தின் விலை அதிரடி வீழ்ச்சி - இன்றைய நிலவரம்",
      titleEn: "Gold prices plunge sharply - today market details",
      descTa: "சர்வதேச சந்தையில் ஏற்பட்ட மாற்றங்கள் காரணமாக தங்கம் மற்றும் வெள்ளியின் விலை இன்று சற்று குறைந்துள்ளது.",
      descEn: "Yellow metal prices fall across major Indian cities following global bullion rate drops.",
      contentTa: "ஆபரண தங்கத்தின் விலை இன்று சவரனுக்கு 400 ரூபாய் வரை குறைந்து நுகர்வோரை மகிழ்ச்சியில் ஆழ்த்தியுள்ளது. திருமண விழாக்காலம் நெருங்குவதால் இந்த விலை வீழ்ச்சி பெரும் வரவேற்பை பெற்றுள்ளது.",
      contentEn: "Gold and silver bullion values corrected downwards in domestic retail hubs. Market analysts expect the softening trend to continue for a few more days.",
      authorName: "எஸ். ரமேஷ்",
      authorRole: "வணிக நிருபர்",
      pubDate: "21 மே 2025 | 03:00 PM",
      readTime: "2 நிமிட வாசிப்பு",
      readTimeEn: "2 Min Read",
      categoryName: "வணிகம்",
      categoryNameEn: "Business",
      categorySlug: "business",
      tags: ["தங்கம்", "விலை வீழ்ச்சி", "சந்தை"],
      gradient: "linear-gradient(135deg, #047857, #10B981)"
    },
    {
      id: 'demo-13',
      titleTa: "IPL 2025: சென்னை சூப்பர் கிங்ஸ் அணி இறுதிப்போட்டிக்கு தகுதி பெற்றது",
      titleEn: "IPL 2025: Chennai Super Kings qualify for the grand finale",
      descTa: "ரசிகர்களை பரவசப்படுத்திய பரபரப்பான போட்டியில் மும்பை அணியை வீழ்த்தி சென்னை அணி வெற்றி பெற்றது.",
      descEn: "CSK defeats MI in an absolute thriller to book their spot in the final championship clash.",
      contentTa: "ஐபிஎல் 2025 தொடரின் தகுதிச் சுற்று ஆட்டத்தில் சென்னை சூப்பர் கிங்ஸ் அணி, மும்பை இந்தியன்ஸ் அணியை வீழ்த்தி இறுதிப்போட்டிக்குள் நுழைந்தது. இறுதி ஓவர் வரை நீடித்த இந்த ஆட்டம் ரசிகர்களுக்கு பெரும் விருந்தாக அமைந்தது.",
      contentEn: "CSK booked their ticket to the IPL 2025 final with a clinical victory over MI. A match-winning partnership in the middle overs ensured the chase was completed smoothly.",
      authorName: "எம். ராஜேஷ்",
      authorRole: "விளையாட்டு நிருபர்",
      pubDate: "23 மே 2025 | 11:30 PM",
      readTime: "4 நிமிட வாசிப்பு",
      readTimeEn: "4 Min Read",
      categoryName: "விளையாட்டு",
      categoryNameEn: "Sports",
      categorySlug: "sports",
      tags: ["சிஎஸ்கே", "ஐபிஎல்", "கிரிக்கெட்"],
      gradient: "linear-gradient(135deg, #C2410C, #F97316)"
    },
    {
      id: 'demo-14',
      titleTa: "உள்ளூர் விளையாட்டு: கபாடி போட்டித் தொடர் தொடங்கியது",
      titleEn: "Local sports: Kabaddi tournament kicks off",
      descTa: "மாவட்ட அளவிலான கபாடி போட்டிகள் இன்று கோலாகலமாகத் தொடங்கின. 32 அணிகள் பங்கேற்பு.",
      descEn: "District level Kabaddi tournament starts grandly today with 32 teams participating.",
      contentTa: "மாவட்ட அளவிலான கபாடி விளையாட்டுப் போட்டிகள் இன்று காலை உள்ளூர் மைதானத்தில் தொடங்கின. பல்வேறு வட்டாரங்களில் இருந்து வந்துள்ள சிறந்த வீரர்கள் இதில் பங்கேற்றுள்ளனர். இறுதிப் போட்டி ஞாயிற்றுக்கிழமை நடைபெறும்.",
      contentEn: "The annual district-level Kabaddi championship commenced today with over 32 local clubs registered for the opening rounds. The final match takes place this Sunday.",
      authorName: "எம். ராஜேஷ்",
      authorRole: "விளையாட்டு நிருபர்",
      pubDate: "23 மே 2025 | 09:00 PM",
      readTime: "3 நிமிட வாசிப்பு",
      readTimeEn: "3 Min Read",
      categoryName: "விளையாட்டு",
      categoryNameEn: "Sports",
      categorySlug: "sports",
      tags: ["கபாடி", "விளையாட்டு", "உள்ளூர்"],
      gradient: "linear-gradient(135deg, #F97316, #FB923C)"
    },
    {
      id: 'demo-19',
      titleTa: "விஜய் 69-வது படம்: அனிருத் இசையமைப்பில் உருவாவதாக அதிகாரப்பூர்வ அறிவிப்பு",
      titleEn: "Vijay 69th film: Anirudh officially confirmed as music director",
      descTa: "திரையுலகமே பெரிதும் எதிர்பார்த்த பிரம்மாண்ட கூட்டணி மீண்டும் இணைகிறது. ரசிகர்கள் பெரும் கொண்டாட்டத்தில் உள்ளனர்.",
      descEn: "The highly anticipated cinematic team collaborates again for Thalapathy Vijay’s final project.",
      contentTa: "விஜய்யின் கடைசி படமான விஜய் 69 படத்திற்கு அனிருத் ரவிச்சந்தர் இசையமைப்பார் என்று தயாரிப்பு நிறுவனம் அதிகாரப்பூர்வமாக அறிவித்துள்ளது. இது ரசிகர்களிடையே பெரும் எதிர்பார்ப்பை தூண்டியுள்ளது.",
      contentEn: "Thalapathy Vijay's final film, tentatively called Vijay 69, will have musical scores composed by rockstar Anirudh. It is going to be a blockbuster audio track, the team promised.",
      authorName: "கே. சூர்யா",
      authorRole: "சினிமா நிருபர்",
      pubDate: "20 மே 2025 | 10:00 AM",
      readTime: "2 நிமிட வாசிப்பு",
      readTimeEn: "2 Min Read",
      categoryName: "பொழுதுபோக்கு",
      categoryNameEn: "Cinema",
      categorySlug: "cinema",
      tags: ["விஜய் 69", "அனிருத்", "சினிமா"],
      gradient: "linear-gradient(135deg, #BE185D, #EC4899)"
    },
    {
      id: 'demo-20',
      titleTa: "ஆஸ்கார் 2026 பரிந்துரை பட்டியலில் இடம் பிடித்த தமிழ் திரைப்படம்",
      titleEn: "Tamil movie shortlisted for Oscar 2026 official nominations",
      descTa: "இந்தியாவின் அதிகாரப்பூர்வ பிரதிநிதியாக தமிழ் படம் தேர்வு செய்யப்பட்டுள்ளதாக திரைப்பட கூட்டமைப்பு அறிவித்துள்ளது.",
      descEn: "Film Federation of India nominates Tamil cinema masterpiece as the country’s official submission.",
      contentTa: "ஆஸ்கார் 2026 விருதுகளுக்கான இந்தியாவின் அதிகாரப்பூர்வ பரிந்துரையாக ஒரு பிரபல தமிழ் திரைப்படம் தேர்ந்தெடுக்கப்பட்டுள்ளது. இதனால் தமிழ் சினிமா உலகம் பெருமிதம் அடைந்துள்ளது.",
      contentEn: "An acclaimed Tamil independent film was nominated by the selection committee as India's official entry for the Best International Feature category at the Oscars.",
      authorName: "கே. சூர்யா",
      authorRole: "சினிமா நிருபர்",
      pubDate: "20 மே 2025 | 03:00 PM",
      readTime: "4 நிமிட வாசிப்பு",
      readTimeEn: "4 Min Read",
      categoryName: "பொழுதுபோக்கு",
      categoryNameEn: "Cinema",
      categorySlug: "cinema",
      tags: ["ஆஸ்கார்", "தமிழ் சினிமா", "விருது"],
      gradient: "linear-gradient(135deg, #EC4899, #F472B6)"
    },
    {
      id: 'demo-25',
      titleTa: "ChatGPT 5.0 வெளியீடு: செயற்கை நுண்ணறிவில் அடுத்த கட்ட பாய்ச்சல்",
      titleEn: "ChatGPT 5.0 launched: next paradigm shift in artificial intelligence",
      descTa: "புதிய மனித உணர்வுகளைப் புரிந்துகொள்ளும் திறன் மற்றும் மிக வேகமான பதிலளிப்பு வசதிகள் கொண்ட புதிய மாடல் அறிமுகம்.",
      descEn: "OpenAI introduces its latest frontier model with advanced emotional intelligence and reasoning capabilities.",
      contentTa: "செயற்கை நுண்ணறிவு ஜாம்பவனான OpenAI தனது புதிய மாடலான ChatGPT 5.0 ஐ வெளியிட்டுள்ளது. இது மனித உரையாடலை விடவும் மிக நெருக்கமாக சிந்தித்து பதிலளிக்கும் திறன் கொண்டது.",
      contentEn: "OpenAI has officially launched ChatGPT 5.0 globally. The model introduces multi-modal interaction controls, zero-latency voice sync, and context retention capacity.",
      authorName: "ஏ. கவிதா",
      authorRole: "தொழில்நுட்ப செய்தியாளர்",
      pubDate: "22 மே 2025 | 09:00 AM",
      readTime: "4 நிமிட வாசிப்பு",
      readTimeEn: "4 Min Read",
      categoryName: "தொழில்நுட்பம்",
      categoryNameEn: "Tech",
      categorySlug: "tech",
      tags: ["ஏஐ", "சாட்ஜிபிடி", "தொழில்நுட்பம்"],
      gradient: "linear-gradient(135deg, #6D28D9, #A855F7)"
    },
    {
      id: 'demo-26',
      titleTa: "ஆப்பிள் நிறுவனத்தின் புதிய ஐபோன் 17 சீரிஸ் சிறப்பம்சங்கள் கசிந்தன",
      titleEn: "Apple iPhone 17 series specifications leaked online",
      descTa: "மெல்லிய வடிவமைப்பு, மேம்பட்ட பேட்டரி ஆயுள் மற்றும் சக்திவாய்ந்த கேமரா அமைப்புகள் இடம்பெறுவது உறுதியாகியுள்ளது.",
      descEn: "Leaked details hint at ultra-slim profile redesign and enhanced battery and optical zoom units.",
      contentTa: "ஆப்பிள் நிறுவனத்தின் அடுத்த அறிமுகமான ஐபோன் 17 தொடரின் வடிவமைப்பு மற்றும் கேமரா விவரங்கள் இணையத்தில் கசிந்துள்ளன. இது முன்பை விட மிகவும் மெலிதான உடலமைப்பு கொண்டதாக இருக்கும்.",
      contentEn: "Leakers have exposed the blueprint specifications for Apple's upcoming iPhone 17 family. Highlights include a custom display refresh rate controller and dynamic design.",
      authorName: "ஏ. கவிதா",
      authorRole: "தொழில்நுட்ப செய்தியாளர்",
      pubDate: "22 மே 2025 | 12:00 PM",
      readTime: "3 நிமிட வாசிப்பு",
      readTimeEn: "3 Min Read",
      categoryName: "தொழில்நுட்பம்",
      categoryNameEn: "Tech",
      categorySlug: "tech",
      tags: ["ஐபோன் 17", "ஆப்பிள்", "மொபைல்"],
      gradient: "linear-gradient(135deg, #A855F7, #C084FC)"
    }
  ];

  const loadData = () => {
    const idKey = String(id).startsWith('demo-') ? id : `demo-${id}`;
    const fallbackArticle = allFallbackArticles.find(art => art.id === idKey) || allFallbackArticles[0];
    // 1. Fetch single article
    fetchApi(`/articles/${id}`)
      .then(data => {
        if (data && data.titleTa) {
          setArticle({
            id: data.id || data.article_id,
            titleTa: data.titleTa,
            titleEn: data.titleEn,
            descTa: data.shortDescTa,
            descEn: data.shortDescEn,
            contentTa: data.contentTa,
            contentEn: data.contentEn,
            authorName: data.authorName || 'கே. செல்வக்குமார்',
            authorRole: 'தலைமைச் செய்தி நிருபர்',
            pubDate: data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : '20 மே 2025',
            updDate: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '21 மே 2025',
            readTime: '3 நிமிட வாசிப்பு',
            readTimeEn: '3 Min Read',
            categoryName: 'செய்திகள்',
            categoryNameEn: 'News',
            categorySlug: 'politics',
            tags: ['செய்திகள்', 'தமிழகம்'],
            gradient: 'linear-gradient(135deg, #1E3A8A, #3B82F6)'
          });
        } else {
          setArticle(fallbackArticle);
        }
      })
      .catch(err => {
        console.warn("Could not load article from API, using fallback", err);
        setArticle(fallbackArticle);
      });

    const fallbackComments = [
      { id: 'demo-1', commentorName: 'குமரன்', commentText: 'அருமையான பட்ஜெட் அறிவிப்புகள். குறிப்பாக கல்விக்கான நிதி ஒதுக்கீடு உயர்த்தப்பட்டுள்ளது பாராட்டத்தக்கது.', createdAt: '10 மணி நேரத்திற்கு முன்' },
      { id: 'demo-2', commentorName: 'மகேஷ்வரன்', commentText: 'விவசாயிகளுக்கான இலவச மின்சாரம் மற்றும் மானியங்கள் தொடருமா என்பதில் சட்டமன்றத்தில் தெளிவுபடுத்த வேண்டும்.', createdAt: '8 மணி நேரத்திற்கு முன்' }
    ];

    const fallbackRelated = [
      { id: 'demo-2', titleTa: 'தேசிய தேர்தல் களம்: புது தில்லியில் அனைத்துக் கட்சிக் கூட்டம் இன்று', titleEn: 'National elections: all-party meet in New Delhi today', descTa: 'எதிர்வரும் பாராளுமன்றக் கூட்டத்தொடரை சுமுகமாக நடத்துவது குறித்து முக்கிய விவாதங்கள் நடைபெறுகின்றன.', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', subcatTa: 'தேசியம்', subcatEn: 'National' },
      { id: 'demo-3', titleTa: 'இந்திய-அமெரிக்க வெளியுறவுத் துறை அமைச்சர்கள் சந்திப்பு - முக்கிய ஒப்பந்தங்கள்', titleEn: 'India-US foreign ministers meet - key bilateral agreements signed', descTa: 'இரு நாடுகளுக்கு இடையிலான பாதுகாப்பு மற்றும் வர்த்தக உறவுகள் குறித்து உயர்மட்ட ஆலோசனைகள் நடைபெற்றன.', gradient: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)', subcatTa: 'சர்வதேசம்', subcatEn: 'International' }
    ];

    const fallbackTrending = [
      { id: 'demo-1', rank: 1, title: 'சென்னை மெட்ரோ புதிய மெட்ரோ ரயில் திட்டம்' },
      { id: 'demo-2', rank: 2, title: 'தங்கம் விலை அதிரடி வீழ்ச்சி' }
    ];

    // 2. Fetch comments
    fetchApi(`/articles/${id}/comments`)
      .then(data => {
        const formatted = Array.isArray(data) ? data.map(item => ({
          id: item.comment_id || item.id,
          commentorName: item.commentorName || item.commenterName || item.commentor_name || 'Anonymous',
          commentText: item.commentText || item.comment_text,
          createdAt: item.createdAt || '1 மணி நேரம்'
        })) : [];
        setComments([...formatted, ...fallbackComments]);
      })
      .catch(() => {
        setComments(fallbackComments);
      });

    // 3. Related articles
    fetchApi('/articles')
      .then(data => {
        const list = Array.isArray(data) ? data.slice(0, 3).map(item => ({
          id: item.id || item.article_id,
          titleTa: item.titleTa,
          titleEn: item.titleEn,
          descTa: item.shortDescTa,
          descEn: item.shortDescEn,
          subcatTa: 'செய்திகள்',
          subcatEn: 'News',
          gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
        })) : [];
        setRelated([...list, ...fallbackRelated]);
      })
      .catch(() => {
        setRelated(fallbackRelated);
      });

    // 4. Trending
    setTrending(fallbackTrending);
  };

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    fetchApi(`/articles/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        commentorName: commentor,
        commentorEmail: email,
        commentText: msg
      })
    })
    .then(() => {
      triggerToast(lang === 'en' ? 'Comment submitted successfully!' : 'கருத்து வெற்றிகரமாகப் பதியப்பட்டது!');
      setCommentor('');
      setEmail('');
      setMsg('');
      loadData();
    })
    .catch(err => {
      console.warn("API comment failed, saving locally", err);
      const newComment = {
        id: Date.now(),
        commentorName: commentor,
        commentText: msg,
        createdAt: lang === 'en' ? 'Just now' : 'சற்றுமுன்'
      };
      setComments(prev => [...prev, newComment]);
      setCommentor('');
      setEmail('');
      setMsg('');
      triggerToast(lang === 'en' ? 'Comment added!' : 'கருத்து சேர்க்கப்பட்டது!');
    });
  };

  const triggerToast = (msgText) => {
    setToastMessage(msgText);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast(lang === 'en' ? 'Link Copied!' : 'நகலெடுக்கப்பட்டது!');
  };

  if (!article) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>{lang === 'en' ? 'Loading article details...' : 'கட்டுரை ஏற்றப்படுகிறது...'}</div>;
  }

  return (
    <div className="container" style={{ marginTop: '20px', marginBottom: '40px' }}>
      <div className="article-container">
        
        {/* Floating Share Sidebar */}
        <aside className="share-sidebar" id="shareSidebar" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a 
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="share-btn whatsapp" 
            aria-label="Share on WhatsApp"
          >
            <i className="fab fa-whatsapp"></i>
          </a>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="share-btn facebook" 
            aria-label="Share on Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="share-btn twitter" 
            aria-label="Share on Twitter"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a 
            href={`https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="share-btn telegram" 
            aria-label="Share on Telegram"
          >
            <i className="fab fa-telegram-plane"></i>
          </a>
          <button 
            className="share-btn copy" 
            onClick={handleCopyLink} 
            aria-label="Copy Link" 
            title="நகலெடு"
          >
            <i className="fas fa-link"></i>
          </button>
        </aside>

        {/* Main Article Column */}
        <main className="article-main">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <Link to="/">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
            <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
            <Link to={`/category/${article.categorySlug}`}>
              {lang === 'en' ? article.categoryNameEn : article.categoryName}
            </Link>
            <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
            <span>{lang === 'en' ? 'Article' : 'கட்டுரை'}</span>
          </div>

          {/* Headlines */}
          <div className="article-headlines">
            <h1 id="artTitleTa" style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1.4, marginBottom: '10px' }}>
              {article.titleTa}
            </h1>
            <h2 id="artTitleEn" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '20px' }}>
              {article.titleEn}
            </h2>
          </div>

          {/* Meta Info & Byline */}
          <div className="article-meta-info">
            <div className="author-profile">
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--category-color, var(--primary)), #000000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {article.authorName.charAt(0)}
              </div>
              <div className="author-details">
                <h4 id="authorName" style={{ fontWeight: 800, fontSize: '14px' }}>{article.authorName}</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{article.authorRole}</span>
              </div>
            </div>
            <div className="article-time" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <div><i className="far fa-calendar-alt"></i> {lang === 'en' ? 'Published: ' : 'வெளியிடப்பட்டது: '} <span id="pubDate">{article.pubDate}</span></div>
              <div><i className="fas fa-history"></i> {lang === 'en' ? 'Updated: ' : 'புதுப்பிக்கப்பட்டது: '} <span id="updDate">{article.updDate}</span></div>
              <div style={{ fontWeight: 600, color: 'var(--category-color, var(--primary))', marginTop: '4px' }}>
                <i className="far fa-clock"></i> <span id="readTime">{lang === 'en' ? article.readTimeEn : article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Full Width Hero Image */}
          <div className="article-hero-img-container" style={{ margin: '24px 0' }}>
            <div style={{ width: '100%', height: '350px', borderRadius: '12px', background: article.gradient || 'linear-gradient(135deg, #1E3A8A, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                <i className="fas fa-image fa-3x" style={{ marginBottom: '10px' }}></i>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>KINGS 24x7 NEWS MEDIA</span>
              </div>
            </div>
            <div className="caption" id="imgCaption" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
              {lang === 'en' ? 'Photo: Secretariat, Chennai. (File Photo)' : 'படம்: தலைமைச் செயலகம், சென்னை. (கோப்புப் படம்)'}
            </div>
          </div>

          {/* Article Body */}
          <article className="article-body-text" id="articleBody" style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--text-dark)' }}>
            {(lang === 'en' ? article.contentEn : article.contentTa).split('\n').map((para, i) => (
              <p key={i} style={{ marginBottom: '16px' }}>{para}</p>
            ))}
          </article>

          {/* Tags */}
          <div className="article-tags" id="articleTags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '24px 0' }}>
            {article.tags.map((tg, i) => (
              <span className="article-tag" key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                {tg}
              </span>
            ))}
          </div>

          {/* Related Articles Grid */}
          <div className="related-articles" style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' }}>
            <h3 className="related-title" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
              {lang === 'en' ? 'Related News' : 'தொடர்புடைய செய்திகள்'}
            </h3>
            <div className="news-grid-3">
              {related.map(rel => (
                <div 
                  className="news-card" 
                  key={rel.id} 
                  onClick={() => navigate(`/article/${rel.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-img" style={{ background: rel.gradient, height: '140px' }}>
                    <span className="cat-badge" style={{ background: 'var(--category-color, var(--primary))' }}>
                      {lang === 'en' ? rel.subcatEn : rel.subcatTa}
                    </span>
                  </div>
                  <div className="card-body" style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1.4, margin: 0 }}>
                      {lang === 'en' ? rel.titleEn : rel.titleTa}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section" style={{ marginTop: '40px' }}>
            <h3 className="comments-count" id="commentCountTitle" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
              {comments.length} {lang === 'en' ? 'Comments' : 'கருத்துக்கள்'}
            </h3>
            
            <div className="comments-list" id="commentsList" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
              {comments.map((c, i) => (
                <div className="comment-item" key={c.id || i} style={{ display: 'flex', gap: '15px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                  <div className="comment-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(c.commentorName || 'A').charAt(0)}
                  </div>
                  <div className="comment-content" style={{ flex: 1 }}>
                    <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h5 style={{ fontWeight: 800, fontSize: '13px', margin: 0 }}>{c.commentorName}</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.createdAt || new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-text" style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-dark)', margin: 0 }}>
                      {c.commentText || c.comment_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <div className="comment-form-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>
                {lang === 'en' ? 'Share Your Comments' : 'கருத்துக்களைப் பகிரவும்'}
              </h4>
              <form className="comment-form" id="commentForm" onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input 
                    type="text" 
                    placeholder={lang === 'en' ? 'Your Name (Required)' : 'உங்கள் பெயர் (கட்டாயமானது)'}
                    value={commentor}
                    onChange={(e) => setCommentor(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-dark)', fontSize: '13px' }}
                  />
                  <input 
                    type="email" 
                    placeholder={lang === 'en' ? 'Email Address (Will not be published)' : 'மின்னஞ்சல் முகவரி (வெளியிடப்படாது)'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-dark)', fontSize: '13px' }}
                  />
                </div>
                <textarea 
                  placeholder={lang === 'en' ? 'Write your comment here...' : 'உங்கள் கருத்துக்களை இங்கு எழுதவும்...'}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  required
                  rows="4"
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-dark)', fontSize: '13px', resize: 'vertical' }}
                ></textarea>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, width: 'max-content' }}>
                  {lang === 'en' ? 'Post Comment' : 'பதிவு செய்க'}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Sidebar Area */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Weather Widget */}
          <div className="weather-widget" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-cloud-sun" style={{ color: 'var(--primary)' }}></i> 
              {lang === 'en' ? 'Chennai Weather' : 'சென்னை வானிலை'}
            </h4>
            <div className="weather-current" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="temp" style={{ fontSize: '32px', fontWeight: 800 }}>32°C</div>
              <div className="details" style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column' }}>
                <strong style={{ color: 'var(--text-dark)' }}>{lang === 'en' ? 'Partly Cloudy' : 'மேகமூட்டம்'}</strong>
                <span>{lang === 'en' ? 'Humidity: 72%' : 'ஈரப்பதம்: 72%'}</span>
                <span>{lang === 'en' ? 'Wind: 18 km/h' : 'காற்று: 18 km/h'}</span>
              </div>
            </div>
          </div>
          
          {/* Trending Widget */}
          <div className="trending-list" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-fire" style={{ color: '#EF4444' }}></i> 
              {lang === 'en' ? 'Trending News' : 'ட்ரெண்டிங் செய்திகள்'}
            </h4>
            {trending.map(tItem => (
              <div className="trending-item" key={tItem.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span className="rank top3" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  {tItem.rank}
                </span>
                <div className="info" style={{ flex: 1 }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{tItem.title}</h5>
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>

      {/* Toast Alert popup */}
      <div 
        className={`toast-alert ${showToast ? 'show' : ''}`} 
        id="toastAlert"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%) ' + (showToast ? 'translateY(0)' : 'translateY(100px)'),
          opacity: showToast ? 1 : 0,
          background: 'var(--primary)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 700,
          zIndex: 99999,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {toastMessage}
      </div>
    </div>
  );
};

export default ArticleDetail;
