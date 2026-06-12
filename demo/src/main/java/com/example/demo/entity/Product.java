package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "namePr")
    private String namePr;

    @ManyToOne
    @JoinColumn(name = "idcat")
    private Category category;

    public int getId() {
        return id;
    }

    public String getNamePr() {
        return namePr;
    }

    public void setNamePr(String namePr) {
        this.namePr = namePr;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}