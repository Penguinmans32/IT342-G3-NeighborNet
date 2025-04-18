package com.example.neighbornetbackend.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class PerformanceFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        long startTime = System.currentTimeMillis();
        chain.doFilter(request, response);
        long endTime = System.currentTimeMillis();

        if ((endTime - startTime) > 1000) {
            log.warn("Slow request: {} ms for {}",
                    (endTime - startTime),
                    ((HttpServletRequest) request).getRequestURI());
        }
    }

    @Bean
    public FilterRegistrationBean<PerformanceFilter> performanceFilterRegistration() {
        FilterRegistrationBean<PerformanceFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(this);
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}