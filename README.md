**Inspiration**

Sports betting is increasingly popular, but many bettors still make decisions based on gut feelings, Twitter hype, or whatever their friend swears is a "lock". As students interested in software engineering and data-driven decision making, we wanted to build something that feels less like a cold analytics dashboard and more like that one friend who watches way too much sports, but actually backs up their takes with real stats. Instead of encouraging reckless gambling, My Gambling Buddy was designed as an informational companion: a tool that delivers insights on different sports with personality. By mixing real data with slang, humor, and casual commentary, the app makes analysis more approachable, engaging, and easier to digest, like getting advice from a close friend who knows the numbers and isn't afraid to crack a joke while explaining them.

**What it does
**
My Gambling Buddy is a multi-sport assistant that helps users make more informed betting decisions across NBA, NFL, NHL, MLB, and La Liga by analyzing player and team data. Instead of overwhelming users with raw numbers, the tool presents insights in a casual, slang-filled, and sometimes comedic tone, like getting advice from a friend who knows the stats and talks trash while explaining them. Users can:

- View a player's recent performance and trends
- Compare two players statistically
- See a team's upcoming games
- Get over/under insights based on recent data By combining live sports statistics with AI-generated explanations and a friendly personality, My Gambling Buddy turns complex data into easy-to-understand, engaging insights that users can use responsibly before placing a bet.

**How we built it
**
- We built My Gambling Buddy using a full-stack architecture designed for flexibility and scalability. The frontend was developed with HTML, CSS, and JavaScript, focusing on a clean, intuitive UI/UX that matches the app’s friendly, conversational personality.
- The backend was built in Python using FastAPI, with Uvicorn as the ASGI server to handle requests efficiently. This backend acts as the core engine of the application, processing user inputs, fetching sports data, and coordinating responses.
- We integrated multiple sports data sources to support NBA, NFL, NHL, MLB, and La Liga, retrieving player, team, and game statistics. Custom helper modules were created to analyze recent performance, trends, and comparisons across different sports.
- To make the insights more engaging and accessible, we integrated the OpenAI API to generate natural-language responses that explain the data in a casual, slang-filled, and sometimes comedic tone, like advice from a close friend who actually knows the stats.
- For deployment, the frontend is hosted on Vercel, while the FastAPI backend is deployed on Render, allowing us to maintain a clear separation between client and server. Environment variables were used throughout to securely manage API keys and configuration, and the project was structured modularly to keep the codebase clean and maintainable.

**Challenges we ran into
**
- One of our biggest challenges was working with multiple third-party APIs across different sports. Each API had its own structure, limitations, and data inconsistencies, which required extra logic to handle missing stats, differing formats, and edge cases. Ensuring that the data we presented was accurate and up to date, while still producing consistent AI-generated responses, took careful validation and prompt design.
- Another challenge was coordinating schedules and dividing tasks effectively within a limited hackathon timeframe. We had to quickly identify each team member’s strengths, split frontend and backend responsibilities, and continuously adapt as features evolved.
- Designing a unique and intuitive UI/UX was also a challenge. We wanted the interface to feel friendly and conversational while still being clear and usable, which required multiple design iterations to balance personality with functionality.

**Accomplishments that we're proud of
**
- Successfully integrating real-time NBA data with AI-generated insights
- Designing a modular and extensible backend architecture
- Creating meaningful, readable explanations instead of just displaying raw numbers
- Completing a functional, end-to-end project within a hackathon timeframe

**What we learned
**
This project reinforced core software engineering concepts such as API integration, data handling, modular design, and client–server communication. Working with real-world sports data highlighted the importance of error handling and clean architecture, while integrating AI taught us how to guide models toward reliable, context-aware responses. Collaborating under time constraints strengthened our teamwork and task management skills, and the project served as a valuable reminder of the fundamentals behind building scalable, responsible, and user-focused applications.

**What's next for My Gambling Buddy
**
Next steps for My Gambling Buddy include continuing to refine the user experience and improving the quality, consistency, and personality of the tool’s responses. We plan to further fine-tune how insights are generated so they remain accurate, informative, and aligned with the app’s friendly, conversational tone. In the long term, we aim to explore deeper integration with betting platforms, allowing users to seamlessly transition from analysis to action by connecting to external betting sites. This would be paired with strong responsible-gambling considerations to ensure users are making informed decisions. Additional future improvements include expanding supported markets, enhancing data sources, and evolving My Gambling Buddy into a more comprehensive, transparent, and user-focused sports betting companion.

____________________________________________________________________


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started with My-Gambling-Buddy
UOttawaHack8 project

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
