package com.kingstv.controllers;

import com.kingstv.models.PageContent;
import com.kingstv.repository.PageContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/pages")
public class PageContentController {

    @Autowired
    private PageContentRepository pageContentRepository;

    @GetMapping("/{pageKey}")
    public ResponseEntity<?> getPageContent(@PathVariable String pageKey) {
        Optional<PageContent> pageOpt = pageContentRepository.findById(pageKey);
        if (pageOpt.isPresent()) {
            return ResponseEntity.ok(pageOpt.get());
        }

        // Return a dynamic placeholder template to prevent UI crashes if DB is unseeded
        PageContent fallback = new PageContent();
        fallback.setPageKey(pageKey);
        
        if ("about-us".equalsIgnoreCase(pageKey)) {
            fallback.setTitleTa("எங்களைப் பற்றி");
            fallback.setTitleEn("About Us");
            fallback.setContentTa("கிங்ஸ் 24x7 தமிழ் செய்திகள் இணையதளம் உங்களுக்கு உடனுக்குடன் செய்திகளை வழங்குகிறது.");
            fallback.setContentEn("Kings 24x7 news portal delivers live updates and breaking news across Tamil Nadu.");
            fallback.setContactPhone("+91 98765 43210");
            fallback.setContactEmail("contact@kingstv.com");
            fallback.setContactAddress("123, Anna Salai, Chennai, Tamil Nadu, India");
            fallback.setGoogleMapUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8522384501725!2d80.25828457593673!3d13.044983013280456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52663b6a95fdf5%3A0x6b63d76e737c355c!2sAnna%20Salai%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1720420000000!5m2!1sen!2sin");
        } else if ("careers".equalsIgnoreCase(pageKey)) {
            fallback.setTitleTa("வேலைவாய்ப்பு");
            fallback.setTitleEn("Careers");
            fallback.setContentTa("கிங்ஸ் டிவியில் செய்தி ஊடகத் துறையில் பணியாற்ற ஆர்வமுள்ள தகுதியான நபர்களிடம் இருந்து விண்ணப்பங்கள் வரவேற்கப்படுகின்றன.");
            fallback.setContentEn("Join our dynamic media crew at Kings TV. We look forward to talented journalists and developers.");
        } else if ("privacy-policy".equalsIgnoreCase(pageKey)) {
            fallback.setTitleTa("தனியுரிமைக் கொள்கை");
            fallback.setTitleEn("Privacy Policy");
            fallback.setContentTa("எங்கள் வாசகர்களின் தரவுப் பாதுகாப்பு மற்றும் தனியுரிமையை நாங்கள் மதிக்கிறோம்.");
            fallback.setContentEn("We value the security of our users and enforce strict privacy configurations.");
        } else if ("terms-of-use".equalsIgnoreCase(pageKey)) {
            fallback.setTitleTa("பயன்பாட்டு விதிமுறைகள்");
            fallback.setTitleEn("Terms of Use");
            fallback.setContentTa("எங்கள் சேவைகளை அணுகும்போது நீங்கள் இந்த பயன்பாட்டு விதிமுறைகளை ஏற்றுக்கொள்கிறீர்கள்.");
            fallback.setContentEn("By accessing Kings TV news content, you agree to comply with our Terms of Service.");
        } else {
            fallback.setTitleTa("செய்திகள்");
            fallback.setTitleEn("Page");
            fallback.setContentTa("விவரங்கள் விரைவில் பதிவேற்றப்படும்.");
            fallback.setContentEn("Content will be updated shortly.");
        }

        return ResponseEntity.ok(fallback);
    }

    @PostMapping("/saveUpdate")
    public ResponseEntity<?> saveUpdate(@RequestBody PageContent pageContent) {
        if (pageContent.getPageKey() == null || pageContent.getTitleTa() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "pageKey and Title (Tamil) are required"));
        }
        PageContent saved = pageContentRepository.save(pageContent);
        return ResponseEntity.ok(saved);
    }
}
