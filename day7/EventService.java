package com.example.eventservice.Service;

import com.example.eventservice.Model.EventModel;

import java.util.List;

public interface EventService {
    EventModel createEvent(EventModel eventModel);

    EventModel getEvent(Long eventId);

    List<EventModel> getAllEvents();

    EventModel updateEvent(Long eventId, EventModel eventModel);

    String deleteEvent(Long eventId);
}