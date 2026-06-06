import express from "express";

import { taraAgent }
from "../agents/tara";

import {
  logRequest,
  detectIntent
}
from "../utils/logger";

const router =
  express.Router();

router.post(
  "/ask",
  async (
    req,
    res
  ) => {

    const startTime =
      Date.now();

    try {

      const {
        question
      } = req.body;

      if (
        !question
      ) {

        return res
          .status(400)
          .json({
            error:
              "Question is required"
          });

      }

      const response =
        await taraAgent.generate(
          question
        );

      const answer =
        response.text;

      const lowerAnswer =
        answer.toLowerCase();

      const isFallback =

        lowerAnswer.includes(
          "error"
        )

        ||

        lowerAnswer.includes(
          "unable"
        )

        ||

        lowerAnswer.includes(
          "try again later"
        )

        ||

        lowerAnswer.includes(
          "authentication"
        )

        ||

        lowerAnswer.includes(
          "unavailable"
        );

      logRequest({

        question,

        intent:
          detectIntent(
            question
          ),

        latencyMs:
          Date.now()
          - startTime,

        status:
          isFallback
            ? "failed"
            : "success",

        errorMessage:
          isFallback
            ? answer
            : null

      });

      return res.json({

        answer

      });

    } catch (error) {

      console.error(
        error
      );

      logRequest({

        question:
          req.body
            ?.question || "",

        intent:
          detectIntent(
            req.body
              ?.question || ""
          ),

        latencyMs:
          Date.now()
          - startTime,

        status:
          "failed",

        errorMessage:
          error instanceof Error
            ? error.message
            : "Unknown Error"

      });

      return res
        .status(500)
        .json({

          error:
            "Internal server error"

        });

    }

  }
);

export default router;