# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to: **http://localhost:3000**

---

## 🎮 How to Use the Dashboard

### 1. **Performance Monitor** (Top-Left Panel)
- Shows **FPS** (should be 55-60)
- Shows **Memory Usage**
- Shows **Render Time** and **Processing Time**
- Green indicator = excellent performance

### 2. **Filter Panel** (Second Panel)
- Click categories to filter data
- Use "All" to show all categories
- Use "None" to hide all data
- Filtering is instant (< 100ms)

### 3. **Time Range Selector** (Third Panel)
- **1 Minute**: Shows last 1 minute of data
- **5 Minutes**: Shows last 5 minutes
- **1 Hour**: Shows last hour
- **All Data**: Shows everything

### 4. **Controls** (Fourth Panel)
- **Start Stream**: Begin real-time data updates (every 100ms)
- **Stop Stream**: Pause updates
- **+ 10k / - 10k**: Increase/decrease data points for stress testing

### 5. **Charts**
- **Line Chart**: Shows data over time
- **Bar Chart**: Aggregated by category
- **Scatter Plot**: Interactive (zoom/pan coming soon)
- **Heatmap**: Color-coded 2D visualization

### 6. **Data Table** (Bottom)
- Click column headers to sort
- Scroll smoothly through 10,000+ rows
- Virtual scrolling = only visible rows rendered

---

## 🧪 Testing Performance

### Test 1: Basic Performance
1. Open dashboard
2. Check FPS in Performance Monitor
3. **Expected**: 55-60 FPS

### Test 2: Real-Time Streaming
1. Click "Start Stream"
2. Watch data update in real-time
3. **Expected**: FPS stays above 55

### Test 3: Stress Test
1. Click "+ 10k" multiple times
2. Test with 50,000 points
3. **Expected**: 30+ FPS

### Test 4: Filtering Performance
1. Click different categories
2. **Expected**: Instant response (< 100ms)

### Test 5: Memory Leak Test
1. Start stream
2. Let run for 10+ minutes
3. Check memory in Performance Monitor
4. **Expected**: < 1MB growth per hour

---

## 📁 Important Files to Understand

### Core Files (Start Here)
1. **`app/dashboard/page.tsx`** - Server Component (generates initial data)
2. **`app/dashboard/DashboardClient.tsx`** - Main dashboard UI
3. **`components/providers/DataProvider.tsx`** - State management
4. **`lib/types.ts`** - TypeScript interfaces

### Chart Components
5. **`components/charts/LineChart.tsx`** - Line chart implementation
6. **`components/charts/BarChart.tsx`** - Bar chart with aggregation
7. **`components/charts/ScatterPlot.tsx`** - Scatter plot
8. **`components/charts/Heatmap.tsx`** - Heatmap visualization

### Custom Hooks
9. **`hooks/useDataStream.ts`** - Real-time data streaming
10. **`hooks/useChartRenderer.ts`** - Canvas rendering with RAF
11. **`hooks/useVirtualization.ts`** - Virtual scrolling
12. **`hooks/usePerformanceMonitor.ts`** - Performance tracking

### Utilities
13. **`lib/dataGenerator.ts`** - Generate realistic data
14. **`lib/canvasUtils.ts`** - Canvas helper functions
15. **`lib/performanceUtils.ts`** - Performance monitoring

---

## 🎓 Study Plan (Before Interview)

### Day 1: Understand the Basics
- [ ] Read `SUMMARY.md` completely
- [ ] Understand Next.js App Router (Server vs Client Components)
- [ ] Learn what Canvas API does
- [ ] Understand useMemo, useCallback, React.memo

### Day 2: Study the Code
- [ ] Read `app/dashboard/page.tsx` and `DashboardClient.tsx`
- [ ] Understand how data flows through DataProvider
- [ ] Study one chart component (start with LineChart)
- [ ] Understand how useDataStream works

### Day 3: Performance Concepts
- [ ] Read `PERFORMANCE.md`
- [ ] Understand why we use Canvas instead of SVG
- [ ] Learn about virtual scrolling
- [ ] Understand memory management (sliding window)

### Day 4: Practice Explaining
- [ ] Explain the architecture to someone (or yourself)
- [ ] Practice answering interview questions from SUMMARY.md
- [ ] Try modifying a chart (change colors, add features)
- [ ] Run performance tests and understand the results

### Day 5: Final Review
- [ ] Review all key concepts
- [ ] Make sure you can explain every optimization
- [ ] Practice live coding (add a simple feature)
- [ ] Prepare questions to ask the interviewer

---

## 🔑 Key Concepts to Master

### 1. **Why Canvas?**
- Fast for large datasets (10k+ points)
- Constant performance (doesn't create DOM elements)
- Perfect for data visualization

### 2. **Why useMemo?**
- Avoids expensive recalculations
- Only recomputes when dependencies change
- Critical for performance with large datasets

### 3. **Why Virtual Scrolling?**
- Can't render 10,000 DOM elements efficiently
- Only render visible rows (~20 instead of 10,000)
- Smooth scrolling with unlimited data

### 4. **Why Sliding Window?**
- Prevents memory from growing indefinitely
- Keeps only recent data (last 10,000 points)
- Essential for real-time streaming

### 5. **Why Server Components?**
- Generate data on server (faster initial load)
- Reduce JavaScript sent to client
- Better performance and SEO

---

## 🐛 Common Issues & Solutions

### Issue: Low FPS
**Solution**: 
- Close other browser tabs
- Disable browser extensions
- Use Chrome for best performance

### Issue: "Module not found" errors
**Solution**:
```bash
rm -rf node_modules .next
npm install
```

### Issue: Port 3000 already in use
**Solution**:
```bash
# Kill the process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

### Issue: TypeScript errors
**Solution**:
- Check `tsconfig.json` is present
- Run `npm install` again
- Restart VS Code

---

## 📚 Resources to Study

### Next.js
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering)

### React Performance
- [React useMemo](https://react.dev/reference/react/useMemo)
- [React useCallback](https://react.dev/reference/react/useCallback)
- [React.memo](https://react.dev/reference/react/memo)

### Canvas API
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Canvas Performance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## ✅ Pre-Interview Checklist

- [ ] Can run the project without errors
- [ ] Understand Server vs Client Components
- [ ] Can explain why we use Canvas
- [ ] Know what useMemo, useCallback, React.memo do
- [ ] Understand virtual scrolling concept
- [ ] Can explain memory management strategy
- [ ] Know the performance metrics (60 FPS, < 100ms, etc.)
- [ ] Can modify code (change colors, add simple features)
- [ ] Prepared answers to common questions
- [ ] Tested the dashboard thoroughly

---

## 🎯 Interview Questions You Should Prepare

1. Walk me through the architecture of your dashboard
2. Why did you choose Canvas over SVG?
3. How do you achieve 60 FPS with 10,000 data points?
4. Explain your state management approach
5. How do you prevent memory leaks?
6. What's the difference between Server and Client Components?
7. How would you scale this to 1 million data points?
8. What performance optimizations did you implement?
9. How does virtual scrolling work?
10. What would you improve if you had more time?

**Tip**: For each question, prepare a 2-3 minute answer with examples from your code.

---

## 🎉 You're Ready!

Remember:
- **Be honest** about using AI assistance for learning
- **Understand the concepts** - don't just memorize
- **Be ready to code** - they may ask you to modify something
- **Ask questions** - shows you're thinking critically
- **Stay calm** - you've built something impressive!

**Good luck! 🚀**

