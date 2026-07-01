package com.dp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=";

    public String generateSummary(String combinedText) {

        RestTemplate restTemplate = new RestTemplate();

        String prompt = "Summarize the following product reviews in 3-4 lines with sentiment and key insights:\n" + combinedText;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try{
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    URL+apiKey,
                    request,
                    Map.class);

            List candidates = (List) response.getBody().get("candidates");
            Map first = (Map) candidates.get(0);
            Map contentMap = (Map) first.get("content");
            List parts = (List) contentMap.get("parts");
            Map textMap = (Map) parts.get(0);

            return textMap.get("text").toString();

        }catch(Exception ex){
            ex.printStackTrace();
            return "Unable to generate AI summary at the moment.";
        }
    }
}