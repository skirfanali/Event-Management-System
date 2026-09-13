package com.eventhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank @Size(min = 2, max = 50)
    private String name;
    private String icon;
    private String color;
    @Size(max = 500)
    private String description;
}
