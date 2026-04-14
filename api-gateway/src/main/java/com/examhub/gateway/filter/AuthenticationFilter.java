package com.examhub.gateway.filter;

import com.examhub.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            boolean isRouteMissingAuthHeader = !exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION);

            if (isRouteMissingAuthHeader) {
                exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7).trim();
            }

            try {
                System.out.println("Received Token: [" + authHeader + "]");
                jwtUtil.validateToken(authHeader);
                
                // Role-Based Access Control
                String path = exchange.getRequest().getPath().toString();
                String method = exchange.getRequest().getMethod().name();
                boolean isRestrictedQuestionAction = path.contains("/questions") && !"GET".equals(method);
                
                if (path.startsWith("/api/exams/create") || isRestrictedQuestionAction) {
                    String role = jwtUtil.extractRole(authHeader);
                    if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
                        System.out.println("RBAC Blocked: Expected TEACHER/ADMIN but found " + role);
                        exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete();
                    }
                }
            } catch (Exception e) {
                System.out.println("JWT Validation Error: " + e.getMessage());
                exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Put configuration properties here if needed
    }
}
