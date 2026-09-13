package com.eventhub.service;

import com.eventhub.dto.request.CategoryRequest;
import com.eventhub.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
    List<CategoryResponse> getAll();
    CategoryResponse getById(Long id);
}
