package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    public int getId() {
        return id;
    }

    @Column(name = "NameCt")
    private String NameCt;

    public String getNameCt() {
        return NameCt;
    }

    public void setNameCt(String nameCt) {
        NameCt = nameCt;
    }
}
