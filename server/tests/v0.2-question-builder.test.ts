import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import { createApp } from '../src/app.js';
import { prisma } from '../src/models/prisma.js';

describe('PulseVote v0.2 Question Builder Tests', () => {
  let server: http.Server;
  let userAToken: string;
  let userBToken: string;
  let presentationId: string;
  let userBPresentationId: string;

  const testUserA = {
    name: 'Professor Smith',
    email: `smith_${Date.now()}@example.com`,
    password: 'password123',
  };

  const testUserB = {
    name: 'Professor Jones',
    email: `jones_${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });

    // Register User A
    const resA = await request(server).post('/api/auth/register').send(testUserA);
    userAToken = resA.body.token;

    // Create a presentation for User A
    const presResA = await request(server)
      .post('/api/presentations')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Interactive Lecture on Algorithms',
        description: 'CS101 live lecture session',
      });
    presentationId = presResA.body.presentation.id;

    // Register User B
    const resB = await request(server).post('/api/auth/register').send(testUserB);
    userBToken = resB.body.token;

    // Create a presentation for User B
    const presResB = await request(server)
      .post('/api/presentations')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        title: 'User B Presentation',
      });
    userBPresentationId = presResB.body.presentation.id;
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [testUserA.email, testUserB.email],
          },
        },
      });
    } catch (_err) {
      // ignore cleanup errors
    }

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('1. Question Type Creation (All 7 Types)', () => {
    let mcQuestionId: string;
    let tfQuestionId: string;
    let pollQuestionId: string;
    let ratingQuestionId: string;
    let openTextQuestionId: string;
    let wordCloudQuestionId: string;
    let qaQuestionId: string;

    it('Type 1: Multiple Choice with options and correct answer flag', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'MULTIPLE_CHOICE',
          questionText: 'What is the time complexity of binary search?',
          settings: { allowMultiple: false, hasCorrectAnswer: true },
          options: [
            { text: 'O(1)', isCorrect: false },
            { text: 'O(log n)', isCorrect: true },
            { text: 'O(n)', isCorrect: false },
            { text: 'O(n log n)', isCorrect: false },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.question).toHaveProperty('id');
      expect(res.body.question.type).toBe('MULTIPLE_CHOICE');
      expect(res.body.question.position).toBe(0);
      expect(res.body.question.options).toHaveLength(4);
      expect(res.body.question.options[1].text).toBe('O(log n)');
      expect(res.body.question.options[1].isCorrect).toBe(true);

      mcQuestionId = res.body.question.id;
    });

    it('Type 2: Poll question', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'POLL',
          questionText: 'Which programming language is your primary language?',
          settings: { allowMultiple: true },
          options: [
            { text: 'TypeScript / JavaScript' },
            { text: 'Python' },
            { text: 'Go' },
            { text: 'Rust' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.question.type).toBe('POLL');
      expect(res.body.question.position).toBe(1);
      expect(res.body.question.options).toHaveLength(4);
      pollQuestionId = res.body.question.id;
    });

    it('Type 3: True / False question', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'TRUE_FALSE',
          questionText: 'HTTP is a stateful protocol by default.',
          settings: { correctOption: 'False' },
          options: [
            { text: 'True', isCorrect: false },
            { text: 'False', isCorrect: true },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.question.type).toBe('TRUE_FALSE');
      expect(res.body.question.position).toBe(2);
      expect(res.body.question.options).toHaveLength(2);
      tfQuestionId = res.body.question.id;
    });

    it('Type 4: Rating question', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'RATING',
          questionText: 'How clear was the explanation of graph traversal?',
          settings: { scaleMax: 5, lowLabel: 'Confusing', highLabel: 'Crystal Clear' },
        });

      expect(res.status).toBe(201);
      expect(res.body.question.type).toBe('RATING');
      expect(res.body.question.position).toBe(3);
      ratingQuestionId = res.body.question.id;
    });

    it('Type 5: Open Text question', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'OPEN_TEXT',
          questionText: 'What topic should we dive deeper into next week?',
          settings: { maxChars: 250, placeholder: 'Share your thoughts...' },
        });

      expect(res.status).toBe(201);
      expect(res.body.question.type).toBe('OPEN_TEXT');
      expect(res.body.question.position).toBe(4);
      openTextQuestionId = res.body.question.id;
    });

    it('Type 6: Word Cloud question', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'WORD_CLOUD',
          questionText: 'Describe today lecture in one word',
          settings: { maxWordsPerParticipant: 1 },
        });

      expect(res.status).toBe(201);
      expect(res.body.question.type).toBe('WORD_CLOUD');
      expect(res.body.question.position).toBe(5);
      wordCloudQuestionId = res.body.question.id;
    });

    it('Type 7: Q&A slide', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'Q_AND_A',
          questionText: 'Ask the Professor Anything',
          settings: { allowAnonymous: true },
        });

      expect(res.status).toBe(201);
      expect(res.body.question.type).toBe('Q_AND_A');
      expect(res.body.question.position).toBe(6);
      qaQuestionId = res.body.question.id;
    });

    it('should list all 7 questions in ordered sequence', async () => {
      const res = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(7);
      expect(res.body.questions).toHaveLength(7);

      // Verify strict sequential ordering
      for (let i = 0; i < 7; i++) {
        expect(res.body.questions[i].position).toBe(i);
      }
      expect(res.body.questions[0].id).toBe(mcQuestionId);
      expect(res.body.questions[1].id).toBe(pollQuestionId);
      expect(res.body.questions[2].id).toBe(tfQuestionId);
      expect(res.body.questions[3].id).toBe(ratingQuestionId);
      expect(res.body.questions[4].id).toBe(openTextQuestionId);
      expect(res.body.questions[5].id).toBe(wordCloudQuestionId);
      expect(res.body.questions[6].id).toBe(qaQuestionId);
    });
  });

  describe('2. Question Editing & Type Changing', () => {
    let questionToEditId: string;

    beforeAll(async () => {
      const listRes = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);
      questionToEditId = listRes.body.questions[0].id;
    });

    it('should update question text and options', async () => {
      const res = await request(server)
        .put(`/api/presentations/${presentationId}/questions/${questionToEditId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          questionText: 'What is the average time complexity of QuickSort?',
          options: [
            { text: 'O(n)', isCorrect: false },
            { text: 'O(n log n)', isCorrect: true },
            { text: 'O(n^2)', isCorrect: false },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.question.questionText).toBe('What is the average time complexity of QuickSort?');
      expect(res.body.question.options).toHaveLength(3);
      expect(res.body.question.options[1].text).toBe('O(n log n)');
      expect(res.body.question.options[1].isCorrect).toBe(true);
    });

    it('should change question type from Multiple Choice to Rating', async () => {
      const res = await request(server)
        .put(`/api/presentations/${presentationId}/questions/${questionToEditId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          type: 'RATING',
          questionText: 'Rate your confidence in sorting algorithms',
          settings: { scaleMax: 10, lowLabel: 'Novice', highLabel: 'Expert' },
          options: [],
        });

      expect(res.status).toBe(200);
      expect(res.body.question.type).toBe('RATING');
      expect(res.body.question.options).toHaveLength(0);
      const parsedSettings = JSON.parse(res.body.question.settings);
      expect(parsedSettings.scaleMax).toBe(10);
    });
  });

  describe('3. Question Duplication', () => {
    let targetQuestionId: string;

    beforeAll(async () => {
      const listRes = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);
      targetQuestionId = listRes.body.questions[1].id; // position 1
    });

    it('should duplicate question, place it at position+1, and shift subsequent questions', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions/${targetQuestionId}/duplicate`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(201);
      expect(res.body.question.questionText).toContain('(Copy)');
      expect(res.body.question.position).toBe(2);

      // Verify that the total count increased to 8
      const listRes = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(listRes.body.total).toBe(8);

      // Verify consecutive positions
      for (let i = 0; i < 8; i++) {
        expect(listRes.body.questions[i].position).toBe(i);
      }
    });
  });

  describe('4. Question Reordering', () => {
    it('should reorder questions atomically according to questionIds array', async () => {
      const listRes = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);

      const originalQuestions = listRes.body.questions;
      // Reverse order
      const reversedIds = originalQuestions.map((q: { id: string }) => q.id).reverse();

      const res = await request(server)
        .put(`/api/presentations/${presentationId}/questions/reorder`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          questionIds: reversedIds,
        });

      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(reversedIds.length);
      expect(res.body.questions[0].id).toBe(reversedIds[0]);
      expect(res.body.questions[0].position).toBe(0);
      expect(res.body.questions[reversedIds.length - 1].id).toBe(reversedIds[reversedIds.length - 1]);
    });
  });

  describe('5. Question Deletion & Position Normalization', () => {
    it('should delete a question and re-normalize remaining positions', async () => {
      const listBefore = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);

      const countBefore = listBefore.body.total;
      const questionToDelete = listBefore.body.questions[0];

      const res = await request(server)
        .delete(`/api/presentations/${presentationId}/questions/${questionToDelete.id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Question deleted successfully');

      const listAfter = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(listAfter.body.total).toBe(countBefore - 1);

      // Verify all positions start at 0 and are consecutive
      for (let i = 0; i < listAfter.body.questions.length; i++) {
        expect(listAfter.body.questions[i].position).toBe(i);
      }
    });
  });

  describe('6. Unauthorized Access Enforcement for Questions', () => {
    let userAQuestionId: string;

    beforeAll(async () => {
      const listRes = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userAToken}`);
      userAQuestionId = listRes.body.questions[0].id;
    });

    it('User B cannot list questions of User A (403)', async () => {
      const res = await request(server)
        .get(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    it('User B cannot add a question to User A presentation (403)', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          type: 'OPEN_TEXT',
          questionText: 'Hacked question',
        });

      expect(res.status).toBe(403);
    });

    it('User B cannot get a specific question of User A (403)', async () => {
      const res = await request(server)
        .get(`/api/presentations/${presentationId}/questions/${userAQuestionId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    it('User B cannot update a question of User A (403)', async () => {
      const res = await request(server)
        .put(`/api/presentations/${presentationId}/questions/${userAQuestionId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          questionText: 'Malicious update',
        });

      expect(res.status).toBe(403);
    });

    it('User B cannot duplicate a question of User A (403)', async () => {
      const res = await request(server)
        .post(`/api/presentations/${presentationId}/questions/${userAQuestionId}/duplicate`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    it('User B cannot delete a question of User A (403)', async () => {
      const res = await request(server)
        .delete(`/api/presentations/${presentationId}/questions/${userAQuestionId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    it('User B cannot reorder questions of User A (403)', async () => {
      const res = await request(server)
        .put(`/api/presentations/${presentationId}/questions/reorder`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          questionIds: [userAQuestionId],
        });

      expect(res.status).toBe(403);
    });
  });
});
