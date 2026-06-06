const QUESTIONS = [

  "How much did I spend on food?",

  "What were my top 5 merchants by net spend between January and March 2025?",

  "How much did I spend on Swiggy, including Swiggy Instamart and SWIGGY orders?",

  "How much money did I transfer?",

  "Which transactions look like recurring subscriptions?",

  "Do I have any data for rent in April 2025?",

  "What subscriptions do I have?",

  "What was Saffron Bluechip Equity Fund's return from 2024-01-01 to 2025-01-01?",

  "Rank all funds by one-year return between 2024-01-01 and 2025-01-01, and show the spread between best and worst.",

  "What is my portfolio worth today, and how much have I made on it in absolute INR?",

  "What is my realised return on my Sentinel Nifty Index Fund holding, given when I bought it?",

  "Which holding has the highest return?"

];

async function run() {

  let passed = 0;
  let failed = 0;

  for (const question of QUESTIONS) {

    try {

      const response =
        await fetch(
          "http://localhost:3000/ask",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              question
            })
          }
        );

      const data =
        await response.json();

      const success =
        response.ok &&
        data.answer &&
        data.answer.length > 0;

      if (success) {

        passed++;

        console.log(
          `PASS | ${question}`
        );

      } else {

        failed++;

        console.log(
          `FAIL | ${question}`
        );

      }

    } catch {

      failed++;

      console.log(
        `ERROR | ${question}`
      );

    }

  }

  console.log("\n================");

  console.log(
    `Passed: ${passed}`
  );

  console.log(
    `Failed: ${failed}`
  );

  console.log(
    `Total: ${QUESTIONS.length}`
  );

}

run();