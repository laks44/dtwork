package com.example.eventservice.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.TrueFalseConverter;
import org.hibernate.validator.constraints.Length;


import java.time.Instant;

@Entity
@Table(name = "events")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "event_name")
    @Length(min=3, max=30)
    private String name;
    @Column(name = "event_description")
    private String description;
    @Column(name = "start_date_time")
    private Instant startDateTime;
    @Column(name = "end_date_time")
    private Instant endDateTime;
    @Column(name = "event_venue")
    private Long venueId;
    @Column(name = "event_organizer")
    private Long organizerId;

//    @Convert(converter = TrueFalseConverter.class)
//    private Boolean isDeleted = false;

    @CreationTimestamp
    private Instant createdAt;
    @UpdateTimestamp
    private Instant updatedAt;
}