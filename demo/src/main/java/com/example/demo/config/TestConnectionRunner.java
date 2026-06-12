package com.example.demo.config;

import com.example.demo.entity.test_connection;
import com.example.demo.repository.TestConnectionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestConnectionRunner implements CommandLineRunner {

    private final TestConnectionRepository repository;

    public TestConnectionRunner(TestConnectionRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        test_connection test = new test_connection();
        //test.setMessage("JPA is working!");
        //repository.save(test);

        repository.findAll().forEach(t ->
                System.out.println("✅ Connected! Record: " + t.getId() + " - " + t.getMessage())
        );
    }
}
