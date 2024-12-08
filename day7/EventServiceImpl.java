package com.example.eventservice.Service;

import com.example.eventservice.Entity.Event;
import com.example.eventservice.Exception.ResourceNotFoundException;
import com.example.eventservice.Model.EventModel;
import com.example.eventservice.Repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class EventServiceImpl implements EventService{

    @Autowired
    private EventRepository eventRepository;

    @Override
    public EventModel createEvent(EventModel eventModel) {
        Event event = eventRepository.save(eventModelToEvent(eventModel));
        return eventToEventModel(event);
    }

    @Override
    public EventModel getEvent(Long eventId) {
        Event event = null;
        try {
            event = eventRepository.findById(eventId).get();
        } catch (Exception e) {
            throw new ResourceNotFoundException("Event", "ID", eventId);
        }
        return eventToEventModel(event);
    }

    @Override
    public List<EventModel> getAllEvents() {
        List<Event> eventList = eventRepository.findAll();
        return eventList.stream()
                .map(this::eventToEventModel).toList();
    }

    @Override
    public EventModel updateEvent(Long eventId, EventModel eventModel) {
        Event eventDB = eventRepository.findById(eventId).get();

        if(Objects.nonNull(eventModel.getName()) && !("".equalsIgnoreCase(eventModel.getName()))){
            eventDB.setName(eventModel.getName());
        }

        if(Objects.nonNull(eventModel.getDescription()) && !("".equalsIgnoreCase(eventModel.getDescription()))){
            eventDB.setDescription(eventModel.getDescription());
        }

        if(Objects.nonNull(eventModel.getVenueId())){
            eventDB.setVenueId(eventModel.getVenueId());
        }

        if(Objects.nonNull(eventModel.getOrganizerId())){
            eventDB.setOrganizerId(eventModel.getOrganizerId());
        }

        eventRepository.save(eventDB);

        return eventToEventModel(eventDB);
    }

    @Override
    public String deleteEvent(Long eventId) {
        Event event = eventRepository.findById(eventId).get();
        eventRepository.deleteById(eventId);
//        event.setIsDeleted(true);
//        eventRepository.save(event);
        return "Event with id "+ eventId + " deleted successfully";
    }


    protected Event eventModelToEvent(EventModel eventModel){
        Event event = new Event();
        event.setId(eventModel.getId());
        event.setName(eventModel.getName());
        event.setDescription(eventModel.getDescription());
        event.setVenueId(eventModel.getVenueId());
        event.setOrganizerId(eventModel.getOrganizerId());

        return event;
    }

    protected EventModel eventToEventModel(Event event){

        EventModel eventModel = new EventModel();
        eventModel.setId(event.getId());
        eventModel.setName(event.getName());
        eventModel.setDescription(event.getDescription());
        eventModel.setVenueId(event.getVenueId());
        eventModel.setOrganizerId(event.getOrganizerId());

        return eventModel;
    }
}