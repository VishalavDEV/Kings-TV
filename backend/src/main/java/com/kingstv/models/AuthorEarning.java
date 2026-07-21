package com.kingstv.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "author_earnings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"author_id", "article_id", "earn_date"}))
public class AuthorEarning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_id")
    private Long authorId;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "article_id", nullable = false)
    private Long articleId;

    @Column(name = "article_title")
    private String articleTitle;

    @Column(name = "article_slug")
    private String articleSlug;

    @Column(name = "pageview_count", nullable = false)
    private Long pageviewCount = 0L;

    @Column(name = "earnings_amount", nullable = false, precision = 10, scale = 4)
    private BigDecimal earningsAmount = BigDecimal.ZERO;

    @Column(name = "earn_date", nullable = false)
    private LocalDate earnDate;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public Long getArticleId() { return articleId; }
    public void setArticleId(Long articleId) { this.articleId = articleId; }

    public String getArticleTitle() { return articleTitle; }
    public void setArticleTitle(String articleTitle) { this.articleTitle = articleTitle; }

    public String getArticleSlug() { return articleSlug; }
    public void setArticleSlug(String articleSlug) { this.articleSlug = articleSlug; }

    public Long getPageviewCount() { return pageviewCount; }
    public void setPageviewCount(Long pageviewCount) { this.pageviewCount = pageviewCount; }

    public BigDecimal getEarningsAmount() { return earningsAmount; }
    public void setEarningsAmount(BigDecimal earningsAmount) { this.earningsAmount = earningsAmount; }

    public LocalDate getEarnDate() { return earnDate; }
    public void setEarnDate(LocalDate earnDate) { this.earnDate = earnDate; }
}
