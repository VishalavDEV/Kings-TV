package com.kingstv.services;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class HtmlSanitizer {

    private static final Pattern TRUSTED_VIDEO_DOMAINS = Pattern.compile(
            "^https://(www\\.)?(youtube\\.com|youtube-nocookie\\.com|youtu\\.be|vimeo\\.com|player\\.vimeo\\.com)/.*",
            Pattern.CASE_INSENSITIVE
    );

    public String sanitize(String html) {
        if (html == null) return null;

        // Base safe list
        Safelist safelist = Safelist.relaxed()
                .addTags("iframe", "span", "hr")
                .addAttributes("iframe", "src", "width", "height", "frameborder", "allow", "allowfullscreen", "style")
                .addAttributes("span", "style")
                .addAttributes("div", "style")
                .addAttributes("p", "style")
                .addAttributes("table", "border", "cellpadding", "cellspacing", "style")
                .addProtocols("a", "href", "http", "https", "mailto", "tel");

        String clean = Jsoup.clean(html, safelist);

        Document doc = Jsoup.parseBodyFragment(clean);
        for (Element iframe : doc.select("iframe")) {
            String src = iframe.attr("src");
            if (src == null || !TRUSTED_VIDEO_DOMAINS.matcher(src).matches()) {
                iframe.remove();
            }
        }

        return doc.body().html();
    }
}
