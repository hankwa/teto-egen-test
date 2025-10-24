# Design Guidelines: Teto·Egen Personality Test

## Design Approach
**Reference-Based**: Draw inspiration from modern personality test platforms like 16Personalities and social platforms like Instagram for their friendly, engaging, and shareable result presentations.

## Core Design Principles
- Mobile-first vertical orientation
- Friendly, approachable, and emotionally warm aesthetic
- Privacy-focused messaging throughout
- Shareable, Instagram-worthy result cards

## Color Palette

**Light Mode:**
- Primary: Pastel Pink `#FFE6EB` (350 100% 95%)
- Background: White `#FFFFFF`
- Secondary: Light Gray `#F5F5F5` (0 0% 96%)
- Text Primary: Dark Gray `#2D2D2D` (0 0% 18%)
- Text Secondary: Medium Gray `#6B6B6B` (0 0% 42%)
- Accent: Soft Pink `#FFB3C6` (348 100% 85%)

**Dark Mode:** Not required for this project - maintain light, warm aesthetic throughout

## Typography

**Font Families:**
- Primary: 'Noto Sans KR', sans-serif (for Korean text)
- Secondary: 'Inter', sans-serif (for UI elements)

**Hierarchy:**
- Hero Title: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Body Text: text-base md:text-lg font-normal
- Captions: text-sm font-light

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16 for consistent vertical rhythm
- Section padding: py-12 md:py-16
- Card padding: p-6 md:p-8
- Button padding: px-8 py-4
- Gap spacing: gap-4 md:gap-6

**Container Widths:**
- Mobile: Full width with px-4 padding
- Desktop: max-w-2xl mx-auto (centered, narrow content for readability)

## Component Library

### Navigation
- Minimal top navigation with logo only
- Sticky positioning on scroll
- Background: white with subtle shadow

### Buttons
- Primary CTA: Rounded-full with pastel pink background, white text, shadow-lg
- Secondary: Outline variant with pink border
- Icon buttons: Circular with subtle hover scale

### Cards
- Background: White
- Border: 1px solid light gray
- Border-radius: rounded-2xl
- Shadow: shadow-md with hover:shadow-xl transition
- Padding: p-6 md:p-8

### Progress Indicator
- Step-based progress bar at top
- Circles with connecting lines
- Active step: Pink fill, completed: checkmark, future: gray outline

### Photo Upload Zone
- Dashed border rectangle
- Large upload icon (camera emoji or icon)
- Drag-and-drop visual feedback
- Preview thumbnail after upload

### Survey Questions
- Card-based layout, one question per view
- Two large choice buttons (A/B format)
- Progress indicator showing X/10 questions
- Smooth transition between questions

### Loading State
- AI model loading: Progress bar with percentage
- Animated emoji (rotating or pulsing)
- Text: "AI 모델 불러오는 중..." with gentle animation

### Result Card
- Hero section with large emoji (animal type)
- Title: Animal type + personality type in large text
- Sections clearly separated with subtle dividers
- Keywords displayed as pill-shaped tags with emojis
- Gradient background option for extra visual interest

## Animations

**Entrance Animations:**
- Result page: Fade-in from opacity-0 to opacity-100 over 800ms
- Cards: Slide up from translate-y-8 with staggered delay
- Survey questions: Cross-fade transition

**Interaction Animations:**
- Buttons: Gentle scale on hover (scale-105)
- Cards: Subtle lift on hover (translate-y-1)
- Choice selection: Quick scale feedback

**Loading Animations:**
- Progress bar: Smooth width transition
- Emoji pulse: Gentle breathing effect

## Images

**Hero Section:**
No large hero image. Use clean typography with emoji decoration and pastel background gradient instead.

**Result Page:**
- No external images needed
- Use large emojis (🐶🐱🐰🦊🐻🦌) as primary visual elements
- Generate shareable result card as HTML2Canvas capture

## Section-Specific Design

### Home Screen
- Centered vertical layout
- Large emoji at top (✨ or 🎭)
- App title in bold typography
- 2-3 sentence introduction
- Prominent "시작하기" button
- Small privacy note at bottom

### Step 1: Photo Upload
- Upload zone centered
- Instructions above upload area
- Privacy reassurance: "사진은 서버로 전송되지 않습니다"
- Preview with "다음" button after upload

### Step 2: Survey
- Question number indicator (1/10)
- Question text in large, readable font
- Two choice buttons stacked vertically
- Back button option

### Step 3: Analysis
- Centered loading spinner with emoji
- Progress percentage
- Encouraging text updates

### Step 4: Results
- Scrollable vertical layout
- Result type card at top with large emoji
- Personality summary card
- Physiognomy analysis card
- Keywords as colorful tags
- Dating style in highlighted box
- One-line summary as quote
- Share buttons at bottom (Twitter, Instagram, Facebook)
- Download result image button

## Special Features

**Share Functionality:**
- Capture result section as image using html2canvas
- Pre-filled social media text
- Copy link button

**Offline Support:**
- Cache indication when model is loaded
- "오프라인 모드 가능" badge

**Mobile Optimization:**
- Touch-friendly button sizes (min 44x44px)
- Thumb-zone placement for primary actions
- Vertical scrolling only
- No horizontal overflow