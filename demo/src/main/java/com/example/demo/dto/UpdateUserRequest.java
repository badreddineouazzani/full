package com.example.demo.dto;

import java.util.Map;

public record UpdateUserRequest(String role, Map<String, Boolean> permissions) {}