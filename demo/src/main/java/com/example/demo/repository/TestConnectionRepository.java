package com.example.demo.repository;

import com.example.demo.entity.test_connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestConnectionRepository extends JpaRepository<test_connection, Long> {

}
