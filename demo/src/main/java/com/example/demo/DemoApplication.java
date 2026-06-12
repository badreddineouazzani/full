package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.security.core.userdetails.UserDetailsService;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext context = SpringApplication.run(DemoApplication.class, args);
		//System.out.println(new BCryptPasswordEncoder().encode("123"));

		UserDetailsService userDetailsService = context.getBean(UserDetailsService.class);
		//System.out.println(userDetailsService.getClass().getName());
	}
}