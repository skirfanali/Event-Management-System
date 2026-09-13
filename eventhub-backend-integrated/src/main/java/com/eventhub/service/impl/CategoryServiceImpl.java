package com.eventhub.service.impl;

import com.eventhub.dto.request.CategoryRequest;
import com.eventhub.dto.response.CategoryResponse;
import com.eventhub.entity.Category;
import com.eventhub.exception.*;
import com.eventhub.repository.CategoryRepository;
import com.eventhub.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException("Category already exists: " + request.getName());
        }
        Category cat = Category.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .description(request.getDescription())
                .active(true)
                .build();
        return toResponse(categoryRepository.save(cat));
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        cat.setName(request.getName());
        cat.setIcon(request.getIcon());
        cat.setColor(request.getColor());
        cat.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(cat));
    }

    @Override
    public void delete(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        cat.setActive(false);
        categoryRepository.save(cat);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findByActiveTrueOrderByNameAsc()
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return toResponse(categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id)));
    }

    private CategoryResponse toResponse(Category cat) {
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .icon(cat.getIcon())
                .color(cat.getColor())
                .description(cat.getDescription())
                .active(cat.isActive())
                .eventCount((long) cat.getEvents().size())
                .createdAt(cat.getCreatedAt())
                .build();
    }
}
