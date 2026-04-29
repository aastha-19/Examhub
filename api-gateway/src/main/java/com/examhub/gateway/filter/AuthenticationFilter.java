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
            if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
                return chain.filter(exchange);
            }

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
                
                String role = jwtUtil.extractRole(authHeader);
                String userId = jwtUtil.extractUserId(authHeader);
                String className = jwtUtil.extractClassName(authHeader);

                // Inject headers to downstream
                org.springframework.http.server.reactive.ServerHttpRequest request = exchange.getRequest().mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .header("X-User-Class", className)
                        .build();
                exchange = exchange.mutate().request(request).build();

                // Simple Gateway Level Role-Based Access Control (can be overridden by downstream)
                String path = exchange.getRequest().getPath().toString();
                String method = exchange.getRequest().getMethod().name();
                boolean isRestrictedQuestionAction = path.contains("/questions") && !path.contains("/bookmarks/") && !"GET".equals(method);
                
                if (path.startsWith("/api/exams/create") || isRestrictedQuestionAction) {
                    if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
                        System.out.println("RBAC Blocked: Expected TEACHER/ADMIN but found " + role);
                        exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete();
                    }
                }
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                System.out.println("JWT Expired: " + e.getMessage());
                exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
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
