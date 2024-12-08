package com.example.eventservice.Model;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

//@Getter
//@Setter
//@AllArgsConstructor
//@NoArgsConstructor
public class EventModel {
    private Long id;
    private String name;
    private String description;
    private Instant startDateTime;
    private Instant endDateTime;
    private Long venueId;
    private Long organizerId;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Instant getStartDateTime() {
        return startDateTime;
    }

    public Instant getEndDateTime() {
        return endDateTime;
    }

    public Long getVenueId() {
        return venueId;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStartDateTime(Instant startDateTime) {
        this.startDateTime = startDateTime;
    }

    public void setEndDateTime(Instant endDateTime) {
        this.endDateTime = endDateTime;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }
}