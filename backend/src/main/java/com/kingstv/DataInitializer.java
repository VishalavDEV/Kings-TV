package com.kingstv;

import com.kingstv.models.*;
import com.kingstv.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private VideoContentRepository videoContentRepository;

    @Autowired
    private ObituaryRepository obituaryRepository;

    @Autowired
    private ClassifiedRepository classifiedRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private DirectoryRepository directoryRepository;

    @Autowired
    private WishRepository wishRepository;

    @Autowired
    private WishCategoryRepository wishCategoryRepository;

    @Autowired
    private WebStoryRepository webStoryRepository;

    @Autowired
    private NfcCardRepository nfcCardRepository;

    @Autowired
    private NfcTapHistoryRepository nfcTapHistoryRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void initDatabase() {
        System.out.println("Starting Database Seeding...");

        // Clean up legacy records to force correct UTF-8 re-seeding
        try {
            nfcTapHistoryRepository.deleteAll();
            nfcCardRepository.deleteAll();
            webStoryRepository.deleteAll();
            wishRepository.deleteAll();
            directoryRepository.deleteAll();
            jobRepository.deleteAll();
            classifiedRepository.deleteAll();
            obituaryRepository.deleteAll();
            videoContentRepository.deleteAll();
            articleRepository.deleteAll();
            districtRepository.deleteAll();
            subCategoryRepository.deleteAll();
            categoryRepository.deleteAll();
            System.out.println("Old seeded records cleaned successfully.");
        } catch(Exception e) {
            System.err.println("Clean up failed: " + e.getMessage());
        }

        // 1. Seed Categories
        System.out.println("Seeding Categories...");
        Category politicsCat = seedCategory("Politics", "அரசியல்", "politics", 1, "fas fa-newspaper");
        Category businessCat = seedCategory("Business", "வணிகம்", "business", 2, "fas fa-briefcase");
        Category sportsCat = seedCategory("Sports", "விளையாட்டு", "sports", 3, "fas fa-trophy");
        Category cinemaCat = seedCategory("Cinema", "சினிமா", "cinema", 4, "fas fa-film");
        Category techCat = seedCategory("Technology", "தொழில்நுட்பம்", "tech", 5, "fas fa-laptop");
        Category internationalCat = seedCategory("International", "சர்வதேசம்", "international", 6, "fas fa-globe");

        // 2. Seed SubCategories
        System.out.println("Seeding SubCategories...");
        Long polId = politicsCat.getId();
        Long busId = businessCat.getId();
        Long spoId = sportsCat.getId();
        Long cinId = cinemaCat.getId();
        Long tecId = techCat.getId();

        seedSubCategory(polId, "State", "மாநிலம்", "state", 1);
        seedSubCategory(polId, "National", "தேசியம்", "national", 2);
        seedSubCategory(polId, "International", "சர்வதேசம்", "international", 3);
        seedSubCategory(polId, "Governance", "அரசு கொள்கைகள்", "governance", 4);

        seedSubCategory(busId, "Markets", "சந்தை", "markets", 1);
        seedSubCategory(busId, "Companies", "நிறுவனங்கள்", "companies", 2);
        seedSubCategory(busId, "Investment", "முதலீடு", "investment", 3);
        seedSubCategory(busId, "Startups", "ஸ்டார்ட்அப்", "startups", 4);

        seedSubCategory(spoId, "Cricket", "கிரிக்கெட்", "cricket", 1);
        seedSubCategory(spoId, "Football", "கால்பந்து", "football", 2);
        seedSubCategory(spoId, "Tennis", "டென்னிஸ்", "tennis", 3);
        seedSubCategory(spoId, "Local Sports", "உள்ளூர்", "local-sports", 4);

        seedSubCategory(cinId, "Kollywood", "கோலிவுட்", "kollywood", 1);
        seedSubCategory(cinId, "Bollywood", "பாலிவுட்", "bollywood", 2);
        seedSubCategory(cinId, "Reviews", "விமர்சனங்கள்", "reviews", 3);
        seedSubCategory(cinId, "Music", "இசை", "music", 4);

        seedSubCategory(tecId, "Smartphones", "ஸ்மார்ட் போன்", "smartphones", 1);
        seedSubCategory(tecId, "Software", "மென்பொருள்", "software", 2);
        seedSubCategory(tecId, "AI", "செயற்கை நுண்ணறிவு", "ai", 3);
        seedSubCategory(tecId, "Space", "விண்வெளி", "space", 4);

        Long intId = internationalCat.getId();
        seedSubCategory(intId, "World News", "உலக செய்திகள்", "world-news", 1);
        seedSubCategory(intId, "Neighboring Countries", "அண்டை நாடுகள்", "neighbors", 2);

        // 3. Seed Districts
        System.out.println("Seeding Districts...");
        seedDistrict("Chennai", "சென்னை");
        seedDistrict("Coimbatore", "கோயம்புத்தூர்");
        seedDistrict("Madurai", "மதுரை");
        seedDistrict("Trichy", "திருச்சி");
        seedDistrict("Salem", "சேலம்");

        // 4. Seed Articles
        System.out.println("Seeding Articles...");
        seedArticle(polId, null,
                "தமிழக சட்டமன்றக் கூட்டத்தொடர் புதிய பட்ஜெட் அறிவிப்புகள் – நேரடித் தகவல்கள்",
                "TN assembly budget session new announcements - live reports",
                "பட்ஜெட் கூட்டத்தொடரில் முக்கிய துறைகளுக்கான நிதி ஒதுக்கீடுகள் மற்றும் புதிய திட்டங்கள் குறித்த தகவல்கள் வெளியிடப்பட்டன. கல்வி, சுகாதாரம் மற்றும் உட்கட்டமைப்பு மேம்பாட்டிற்காக கூடுதல் நிதி ஒதுக்கப்பட்டுள்ளது.",
                "Important budget allocations and welfare schemes announced during the state assembly session. Additional funds have been setup for education, health, and urban infrastructure projects.",
                "தமிழக பட்ஜெட் கூட்டத்தொடர் முக்கிய அறிவிப்புகள்.",
                "Tamil Nadu state assembly budget session announcements.",
                "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800",
                150, "tn-budget-session-updates");
        
        seedArticle(polId, null,
                "தேசிய தேர்தல் களம்: புது தில்லியில் அனைத்துக் கட்சிக் கூட்டம் இன்று",
                "National elections: all-party meet in New Delhi today",
                "எதிர்வரும் பாராளுமன்றக் கூட்டத்தொடரை சுமுகமாக நடத்துவது குறித்து முக்கிய விவாதங்கள் நடைபெறுகின்றன. எதிர்கட்சிகள் மற்றும் ஆளுங்கட்சியினர் முக்கிய பிரச்சனைகள் குறித்து ஆலோசிக்கின்றனர்.",
                "Opposition and ruling parties meet to deliberate on parliamentary updates and guidelines. Senior political leaders have joined the discussion to resolve the parliamentary schedule.",
                "புது தில்லியில் அனைத்துக் கட்சிக் கூட்டம் இன்று.",
                "All-party meeting in New Delhi today.",
                "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800",
                120, "national-elections-all-party-meet");

        seedArticle(busId, null,
                "பங்குச்சந்தை வரலாறு காணாத உயர்வு – சென்செக்ஸ் 83,000 புள்ளிகளைத் தாண்டியது",
                "Stock markets reach record highs - Sensex crosses 83,000 points",
                "தொழில்நுட்ப மற்றும் வங்கி பங்குகள் பெரும் லாபம் ஈட்டியதை அடுத்து முதலீட்டாளர்கள் மகிழ்ச்சி அடைந்துள்ளனர். உலகளாவிய சாதகமான சூழல் சந்தை உயர்வுக்கு வழிவகுத்தது.",
                "Tech and Banking sector shares register major gains as domestic markets hit new historic milestones. Favorable global trade signals have fueled the rally.",
                "பங்குச்சந்தை புதிய உச்சம்.",
                "Stock markets hit new records.",
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
                220, "stock-markets-record-highs");

        seedArticle(spoId, null,
                "இந்தியா vs இங்கிலாந்து ஒருநாள் தொடர்: புதிய அணி விவரம் வெளியீடு",
                "India vs England ODI Series: New Squad Announced",
                "இளம் வீரர்களுக்கு வாய்ப்பளிக்கும் வகையில் புதிய இந்திய அணி தேர்வு செய்யப்பட்டுள்ளது. சீனியர் வீரர்களுக்கு ஓய்வளிக்கப்பட்டுள்ளது.",
                "The selection committee has presented the new ODI squad focusing on young talent and resting senior players for the upcoming series.",
                "இந்தியா vs இங்கிலாந்து ஒருநாள் தொடர் அணி விவரம்.",
                "India vs England ODI squad details.",
                "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
                310, "india-england-odi-squad");

        seedArticle(cinId, null,
                "தளபதி விஜய்யின் இறுதித் திரைப்படம்: ரசிகர்களிடையே பெரும் எதிர்பார்ப்பு",
                "Thalapathy Vijay final movie: Huge expectations among fans",
                "அரசியல் பிரவேசத்திற்கு முன்னதாக நடிகர் விஜய் நடிக்கும் இறுதித் திரைப்படம் என்பதால் உலகம் முழுவதும் பெரும் எதிர்பார்ப்பு நிலவி வருகிறது.",
                "As it marks the final cinematic outing of Thalapathy Vijay before his political entry, expectations are running high globally.",
                "விஜய்யின் இறுதித் திரைப்படம் பெரும் எதிர்பார்ப்பு.",
                "Vijay's final movie expectations.",
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
                500, "vijay-final-movie-grand-news");

        // 5. Seed VideoContent
        System.out.println("Seeding Videos...");
        seedVideo(polId, "தமிழக சட்டமன்ற பட்ஜெட் உரை நேரடி ஒளிபரப்பு 2026", "https://www.youtube.com/watch?v=live1", "தமிழக பட்ஜெட் கூட்டத்தொடர் நேரடித் தகவல்கள்.", 1, "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800", 7200);
        seedVideo(spoId, "ஐபிஎல் 2025: சிஎஸ்கே அணியின் புதிய வியூகங்கள் மற்றும் பயிற்சி ஆட்டங்கள்", "https://www.youtube.com/watch?v=csk1", "சென்னை சூப்பர் கிங்ஸ் அணியின் புதிய கேப்டன் தலைமையில் பயிற்சி.", 0, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800", 300);

        // 6. Seed Obituaries
        System.out.println("Seeding Obituaries...");
        seedObituary("கிருஷ்ணசாமி நடராஜன் (வயது 78)", 78, "மயிலாப்பூர், சென்னை", LocalDate.now().minusDays(2), "மின்கம்ப மயானத்தில் நாளை மாலை 4:00 மணியளவில் உடல் தகனம் செய்யப்படவுள்ளது.", "முன்னாள் அரசு அதிகாரிகள் சங்கத் தலைவர் கிருஷ்ணசாமி நடராஜன் அவர்கள் மயிலாப்பூரில் உள்ள அவரது இல்லத்தில் இயற்கை எய்தினார்.");
        seedObituary("மீனாட்சி சுப்பிரமணியன் (வயது 65)", 65, "ஆர்.எஸ்.புரம், கோயம்புத்தூர்", LocalDate.now().minusDays(1), "காந்திபுரம் மயானத்தில் இன்று காலை 11:30 மணியளவில் இறுதிச்சடங்கு நடைபெற்றது.", "அன்பான இல்லத்தரசி மற்றும் சமூக ஆர்வலர் மீனாட்சி சுப்பிரமணியன் அவர்கள் கோயம்புத்தூரில் காலமானார்.");

        // 7. Seed Classifieds
        System.out.println("Seeding Classifieds...");
        seedClassified("2 BHK அடுக்குமாடி குடியிருப்பு விற்பனைக்கு", "Properties", "ரூ. 65 லட்சம்", "அடையாறு, சென்னை", "9876543210", "அடையாறில் உள்ள முக்கிய குடியிருப்பில் 1200 சதுர அடி கொண்ட புதிய 2 BHK பிளாட் விற்பனைக்கு உள்ளது. கார் பார்க்கிங் மற்றும் லிப்ட் வசதி கொண்டது.");
        seedClassified("பயன்படுத்தப்பட்ட மாருதி ஸ்விஃப்ட் கார் விற்பனைக்கு", "Vehicles", "ரூ. 4.2 லட்சம்", "பீளமேடு, கோயம்புத்தூர்", "9876543211", "2020 மாடல் மாருதி ஸ்விஃப்ட் விஎக்ஸ்ஐ பெட்ரோல் கார் விற்பனைக்கு. சிங்கிள் ஓனர், சிறந்த நிலையில் உள்ளது.");

        // 8. Seed Jobs
        System.out.println("Seeding Jobs...");
        seedJob("ஜாவா மென்பொருள் பொறியாளர் (Java Developer)", "Kings Info Solutions", "IT / Tech", "சோழிங்கநல்லூர், சென்னை", "ரூ. 5 - 8 எல்பிஏ (LPA)", "Full Time", "குறைந்தபட்சம் 2 வருட அனுபவம் உள்ள ஜாவா ஸ்பிரிங் பூட் மென்பொருள் பொறியாளர் தேவை. சிறந்த நிரலாக்க அறிவு பெற்றிருக்க வேண்டும்.");
        seedJob("மனிதவள மேலாளர் (HR Manager)", "Royal Group", "Management", "ஆர்.எஸ்.புரம், கோயம்புத்தூர்", "ரூ. 4 - 6 எல்பிஏ (LPA)", "Full Time", "நிறுவனத்தின் மனிதவள செயல்பாடுகள் மற்றும் பணியாளர் சேர்ப்பு பணிகளை நிர்வகிப்பதற்கான திறமை வாய்ந்த எச்.ஆர் மேலாளர் தேவை.");

        // 9. Seed Directory Listings
        System.out.println("Seeding Directory Listings...");
        DirectoryListing kingCafe = seedDirectory("King Cafe", "Cafe / Restaurant", "Anna Nagar, Chennai", "5th Avenue, Anna Nagar", "08:00 AM - 11:00 PM", "9876543210");
        DirectoryListing abirami = seedDirectory("அபிராமி பல்பொருள் அங்காடி", "Retail / Grocery", "மயிலாப்பூர், சென்னை", "கபாலீஸ்வரர் கோவில் தெரு", "09:00 AM - 10:00 PM", "044-24951234");
        DirectoryListing dental = seedDirectory("ஸ்ரீ பாலாஜி டென்டல் கிளினிக்", "Healthcare / Dental", "காந்திபுரம், கோயம்புத்தூர்", "நூறடி சாலை, காந்திபுரம்", "10:00 AM - 08:30 PM", "0422-2521234");

        // Seed NFC Card for King Cafe (first item with ID 1)
        NfcCard card = new NfcCard();
        card.setListingId(kingCafe.getId());
        card.setShortCode("KCARD-10024");
        card.setLinkType("payment");
        card.setUpiId("kingcafe@upi");
        card.setUpiName("King Cafe");
        card.setIsPaymentEnabled(true);
        card.setCardStatus("activated");
        card.setOtpHash("1234");
        card.setTrackingNumber("TRK-987654321");
        NfcCard savedCard = nfcCardRepository.save(card);
        
        // Seed Tap History for King Cafe
        seedTap(savedCard.getId(), "payment", 250.00, "success", "Hari Prakash", "Anna Nagar, Chennai", LocalDateTime.now().minusHours(2));
        seedTap(savedCard.getId(), "profile", 0.0, "success", "Unknown", "T. Nagar, Chennai", LocalDateTime.now().minusHours(3));
        seedTap(savedCard.getId(), "payment", 1120.00, "success", "Priya Sharma", "Anna Nagar, Chennai", LocalDateTime.now().minusDays(1));
        seedTap(savedCard.getId(), "payment", 560.00, "success", "Vignesh R", "Anna Nagar, Chennai", LocalDateTime.now().minusDays(1));

        // 10. Seed Wishes
        System.out.println("Seeding Wishes...");
        seedWish("கார்த்திகேயன் - அனிதா தம்பதியினர்", "Anniversary", "அன்பான கார்த்திகேயன் மற்றும் அனிதா தம்பதியினருக்கு எங்களது இனிய திருமண நாள் நல்வாழ்த்துக்கள்! உங்கள் வாழ்வில் மகிழ்ச்சி என்றும் நிலைக்கட்டும்.", "சுரேஷ் மற்றும் குடும்பத்தினர்");
        seedWish("செல்வன். சஞ்சய் ராஜ் (வயது 12)", "Birthday", "அன்பு மகன் சஞ்சய் ராஜுக்கு இனிய பிறந்தநாள் நல்வாழ்த்துக்கள்! கல்வியிலும் ஒழுக்கத்திலும் சிறந்து விளங்க வாழ்த்துகிறோம்.", "பெற்றோர்கள் மற்றும் உறவினர்கள்");

        // 11. Seed Web Stories
        System.out.println("Seeding Web Stories...");
        String slidesJson1 = "[" +
                "{\"titleTa\":\"ருதுராஜ் கெய்க்வாட் நியமனம்\",\"titleEn\":\"Ruturaj Gaikwad Appointed\",\"descTa\":\"சென்னை சூப்பர் கிங்ஸ் அணியின் புதிய கேப்டனாக ருதுராஜ் கெய்க்வாட் நியமிக்கப்பட்டுள்ளார்.\",\"descEn\":\"Ruturaj Gaikwad has been officially appointed as the new captain of Chennai Super Kings.\"}," +
                "{\"titleTa\":\"தோனியின் ஆலோசனை\",\"titleEn\":\"Dhoni Advises\",\"descTa\":\"ருதுராஜின் தலைமைப் பண்பை வளர்க்கும் வகையில் தோனி அவருக்கு முக்கிய ஆலோசனைகளை வழங்கியுள்ளார்.\",\"descEn\":\"Dhoni has shared key leadership strategies with Gaikwad to ensure a smooth transition.\"}," +
                "{\"titleTa\":\"ரசிகர்களின் எதிர்பார்ப்பு\",\"titleEn\":\"Fans Expectations\",\"descTa\":\"புதிய கேப்டனின் தலைமையில் சென்னை அணி மீண்டும் சாம்பியன் கோப்பையை வெல்லும் என ரசிகர்கள் நம்புகின்றனர்.\",\"descEn\":\"Fans are highly optimistic that Chennai will lift the cup again under the new captaincy.\"}" +
                "]";
        seedWebStory(sportsCat, "ஐபிஎல் 2025: சிஎஸ்கே புதிய கேப்டன் யார்?", "IPL 2025: Who is the next captain of CSK?", "sports", "NEW", "linear-gradient(135deg, #FF5722, #FF9800)", slidesJson1);

        String slidesJson2 = "[" +
                "{\"titleTa\":\"மாபெரும் எதிர்பார்ப்புகள்\",\"titleEn\":\"High Expectations\",\"descTa\":\"தளபதி விஜய் நடிக்கும் கடைசி திரைப்படம் என்பதால் தமிழகம் முழுவதும் பெரும் எதிர்பார்ப்பு கிளம்பியுள்ளது.\",\"descEn\":\"As it marks the final on-screen outing of Thalapathy Vijay, expectations are soaring sky-high.\"}," +
                "{\"titleTa\":\"வெங்கட் பிரபு இயக்கம்\",\"titleEn\":\"Direction by Venkat Prabhu\",\"descTa\":\"புதுமையான பாணியில் திரைக்கதை அமைப்பதில் வல்லவரான வெங்கட் பிரபு இந்த படத்தை இயக்குகிறார்.\",\"descEn\":\"Director Venkat Prabhu known for his screenplay tricks is handling this political action entertainer.\"}," +
                "{\"titleTa\":\"அனிருத் இசையமைப்பு\",\"titleEn\":\"Musical Scores by Anirudh\",\"descTa\":\"திரைப்படத்தின் பாடல்கள் மற்றும் பின்னணி இசையை ராக்ஸ்டார் அனிருத் வடிவமைக்கிறார்.\",\"descEn\":\"Rockstar Anirudh is scoring the tracks, promising a massive audio treat for fans.\"}" +
                "]";
        seedWebStory(cinemaCat, "விஜய்யின் கடைசி படம்: என்ன எதிர்பார்ப்பு?", "Vijay final movie: What can we expect?", "cinema", "HOT", "linear-gradient(135deg, #E91E63, #9C27B0)", slidesJson2);

        System.out.println("Database Seeding Check Complete!");
    }

    private Category seedCategory(String name, String nameTa, String slug, int order, String icon) {
        Category cat = new Category();
        cat.setName(name);
        cat.setNameTa(nameTa);
        cat.setSlug(slug);
        cat.setDisplayOrder(order);
        cat.setIcon(icon);
        cat.setIsNav(true);
        cat.setIsActive(true);
        return categoryRepository.save(cat);
    }

    private void seedSubCategory(Long catId, String name, String nameTa, String slug, int order) {
        SubCategory sub = new SubCategory();
        sub.setCategoryId(catId);
        sub.setName(name);
        sub.setNameTa(nameTa);
        sub.setSlug(slug);
        sub.setDisplayOrder(order);
        sub.setStatus("active");
        subCategoryRepository.save(sub);
    }

    private void seedDistrict(String nameEn, String nameTa) {
        District dist = new District();
        dist.setNameEn(nameEn);
        dist.setNameTa(nameTa);
        districtRepository.save(dist);
    }

    private void seedArticle(Long catId, Long distId, String titleTa, String titleEn, String contentTa, String contentEn, String shortDescTa, String shortDescEn, String imageUrl, int views, String slug) {
        Article art = new Article();
        art.setCategoryId(catId);
        art.setDistrictId(distId);
        art.setTitleTa(titleTa);
        art.setTitleEn(titleEn);
        art.setContentTa(contentTa);
        art.setContentEn(contentEn);
        art.setShortDescTa(shortDescTa);
        art.setShortDescEn(shortDescEn);
        art.setImageUrl(imageUrl);
        art.setViewsCount(views);
        art.setStatus("published");
        art.setSlug(slug);
        art.setMetaTitle(titleEn);
        art.setMetaDescription(shortDescEn);
        art.setMetaKeywords(slug.replace("-", ", "));
        art.setCanonicalUrl("http://localhost:5000/articles/" + slug);
        art.setFeaturedImage(imageUrl);
        articleRepository.save(art);
    }

    private void seedVideo(Long catId, String title, String youtubeUrl, String desc, int isLive, String thumb, int duration) {
        VideoContent vid = new VideoContent();
        vid.setCategoryId(catId);
        vid.setTitle(title);
        vid.setYoutubeUrl(youtubeUrl);
        vid.setDescription(desc);
        vid.setIsLiveTv(isLive);
        vid.setThumbnailUrl(thumb);
        vid.setDurationSeconds(duration);
        vid.setStatus("published");
        videoContentRepository.save(vid);
    }

    private void seedObituary(String deceasedName, int age, String location, LocalDate demiseDate, String funeralDetails, String shortDesc) {
        Obituary obit = new Obituary();
        obit.setDeceasedName(deceasedName);
        obit.setAge(age);
        obit.setLocation(location);
        obit.setDemiseDate(demiseDate);
        obit.setFuneralDetails(funeralDetails);
        obit.setShortDescription(shortDesc);
        obit.setTributeCount(0);
        obit.setStatus("published");
        obituaryRepository.save(obit);
    }

    private void seedClassified(String title, String category, String price, String location, String contact, String desc) {
        ClassifiedListing listing = new ClassifiedListing();
        listing.setTitle(title);
        listing.setCategory(category);
        listing.setPriceDetail(price);
        listing.setLocation(location);
        listing.setContactInfo(contact);
        listing.setDescription(desc);
        listing.setStatus("active");
        classifiedRepository.save(listing);
    }

    private void seedJob(String title, String company, String category, String location, String salary, String type, String desc) {
        JobPosting job = new JobPosting();
        job.setTitle(title);
        job.setCompanyName(company);
        job.setCategory(category);
        job.setLocation(location);
        job.setSalaryRange(salary);
        job.setEmploymentType(type);
        job.setDescription(desc);
        job.setStatus("active");
        jobRepository.save(job);
    }

    private DirectoryListing seedDirectory(String name, String cat, String locality, String street, String hours, String phone) {
        DirectoryListing business = new DirectoryListing();
        business.setBusinessName(name);
        business.setCategory(cat);
        business.setAddressLocality(locality);
        business.setAddressStreet(street);
        business.setWorkingHours(hours);
        business.setPhoneNumber(phone);
        business.setStatus("active");
        return directoryRepository.save(business);
    }

    private void seedTap(Long cardId, String type, Double amount, String status, String customer, String city, LocalDateTime time) {
        NfcTapHistory tap = new NfcTapHistory();
        tap.setCardId(cardId);
        tap.setTapType(type);
        tap.setAmount(amount);
        tap.setStatus(status);
        tap.setCustomerName(customer);
        tap.setLocationCity(city);
        tap.setTappedAt(time);
        nfcTapHistoryRepository.save(tap);
    }

    private void seedWish(String recipient, String catSlug, String message, String sender) {
        Wish wish = new Wish();
        wish.setRecipientName(recipient);
        
        WishCategory category = wishCategoryRepository.findBySlug(catSlug)
            .orElseGet(() -> wishCategoryRepository.findBySlug("general").orElse(null));
        wish.setCategory(category);
        
        wish.setMessage(message);
        wish.setSenderName(sender);
        wish.setStatus("published");
        wishRepository.save(wish);
    }

    private void seedWebStory(Category cat, String titleTa, String titleEn, String catSlug, String badge, String gradient, String slidesJson) {
        WebStory story = new WebStory();
        story.setTitleTa(titleTa);
        story.setTitleEn(titleEn);
        story.setTitle(titleEn);
        story.setCat(catSlug);
        story.setCategoryId(cat != null ? cat.getId() : 1L);
        story.setBadge(badge);
        story.setBackgroundGradient(gradient);
        story.setSlidesJson(slidesJson);
        story.setStatus("published");
        webStoryRepository.save(story);
    }
}
