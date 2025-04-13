package com.example.neighbornetbackend.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FileProcessingService {
    private static final Logger logger = LoggerFactory.getLogger(FileProcessingService.class);

    public String extractTextFromFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        try {
            String contentType = file.getContentType();
            InputStream inputStream = file.getInputStream();

            if (contentType == null) {
                return "Could not determine file type";
            }

            if (contentType.equals("application/pdf")) {
                return extractTextFromPdf(inputStream);
            } else if (contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
                return extractTextFromDocx(inputStream);
            } else if (contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation")) {
                return extractTextFromPptx(inputStream);
            } else if (contentType.equals("text/plain")) {
                return new String(file.getBytes());
            } else {
                return "Unsupported file type: " + contentType;
            }
        } catch (Exception e) {
            logger.error("Error extracting text from file: " + fileName, e);
            return "Failed to process file: " + e.getMessage();
        }
    }

    private String extractTextFromPdf(InputStream inputStream) throws Exception {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractTextFromDocx(InputStream inputStream) throws Exception {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            List<XWPFParagraph> paragraphs = document.getParagraphs();

            return paragraphs.stream()
                    .map(XWPFParagraph::getText)
                    .filter(text -> !text.trim().isEmpty())
                    .collect(Collectors.joining("\n"));
        }
    }

    private String extractTextFromPptx(InputStream inputStream) throws Exception {
        try (XMLSlideShow ppt = new XMLSlideShow(inputStream)) {
            StringBuilder sb = new StringBuilder();

            for (XSLFSlide slide : ppt.getSlides()) {
                sb.append("--- Slide ").append(slide.getSlideNumber()).append(" ---\n");

                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape) {
                        XSLFTextShape textShape = (XSLFTextShape) shape;
                        String text = textShape.getText();
                        if (text != null && !text.trim().isEmpty()) {
                            sb.append(text).append("\n");
                        }
                    }
                }
                sb.append("\n");
            }

            return sb.toString();
        }
    }
}