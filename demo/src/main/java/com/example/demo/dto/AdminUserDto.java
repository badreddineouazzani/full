package com.example.demo.dto;

import java.util.List;

public record AdminUserDto(Long id, String username, List<String> roles) {}