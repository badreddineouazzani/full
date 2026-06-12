package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

public class BotBlockerFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(BotBlockerFilter.class);

    private static final Set<String> BLOCKED_AGENTS = Set.of(
            "curl",
            "wget",
            "python-requests",
            "python-urllib",
            "scrapy",
            "httpclient",
            "go-http-client",
            "java/",
            "bot",
            "spider",
            "crawler"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String userAgent = request.getHeader("User-Agent");

        if (isBot(userAgent)) {
            log.warn("Blocked bot: UA='{}' IP={} URI={}",
                    userAgent, request.getRemoteAddr(), request.getRequestURI());
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Automated clients are not allowed\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isBot(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return true;
        }
        String ua = userAgent.toLowerCase();
        return BLOCKED_AGENTS.stream().anyMatch(ua::contains);
    }
}