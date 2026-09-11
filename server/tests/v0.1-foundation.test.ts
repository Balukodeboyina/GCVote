import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import http from 'http';
import { createApp } from '../src/app.js';
import { prisma } from '../src/models/prisma.js';

describe('PulseVote v0.1 Foundation Tests', () => {
  let server: http.Server;
  let userAToken: string;
  let userBToken: string;
  let userAPresentationId: string;

  const testUserA = {
    name: 'Presenter Alice',
    email: `alice_${Date.now()}@example.com`,
    password: 'password123',
  };

  const testUserB = {
    name: 'Presenter Bob',
    email: `bob_${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
  });

  afterAll(async () => {
    // Cleanup created test users and their presentations (cascade)
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

  describe('1. Presenter Registration', () => {
    it('should register a new presenter successfully with hashed password', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send(testUserA);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testUserA.email);
      expect(res.body.user.name).toBe(testUserA.name);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.body).toHaveProperty('token');

      userAToken = res.body.token;

      // Verify in DB that password is NOT stored as plain text
      const dbUser = await prisma.user.findUnique({
        where: { email: testUserA.email },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser!.passwordHash).not.toBe(testUserA.password);
      expect(dbUser!.passwordHash.startsWith('$2')).toBe(true); // bcrypt hash
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send(testUserA);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject registration with invalid input (e.g. short password)', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Bad User',
          email: 'bad@example.com',
          password: 'short', // < 8 characters
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('2. Presenter Login & Invalid Login', () => {
    it('should login with correct credentials and issue token & cookie', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUserA.email,
          password: testUserA.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUserA.email);

      // Verify Set-Cookie header is sent
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should reject login with incorrect password (401)', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({
          email: testUserA.email,
          password: 'wrong_password_999',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid email or password.');
    });

    it('should reject login with non-existent email (401)', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid email or password.');
    });
  });

  describe('3. Protected Route & Logout', () => {
    it('should reject accessing /api/auth/me without token (401)', async () => {
      const res = await request(server).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should allow accessing /api/auth/me with valid Bearer token', async () => {
      const res = await request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUserA.email);
      expect(res.body).toHaveProperty('totalPresentations');
    });

    it('should logout and clear authentication cookie', async () => {
      const res = await request(server).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });
  });

  describe('4. Presentation CRUD', () => {
    it('should create a new presentation for the authenticated user (201)', async () => {
      const res = await request(server)
        .post('/api/presentations')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Quarterly Town Hall 2026',
          description: 'Company-wide interactive updates and live Q&A',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('presentation');
      expect(res.body.presentation.title).toBe('Quarterly Town Hall 2026');
      expect(res.body.presentation.description).toBe('Company-wide interactive updates and live Q&A');
      expect(res.body.presentation).toHaveProperty('id');
      expect(res.body.presentation).toHaveProperty('createdAt');
      expect(res.body.presentation).toHaveProperty('updatedAt');

      userAPresentationId = res.body.presentation.id;
    });

    it('should read all presentations belonging to the authenticated user', async () => {
      const res = await request(server)
        .get('/api/presentations')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('presentations');
      expect(res.body.presentations.length).toBeGreaterThanOrEqual(1);
      expect(res.body.presentations[0].title).toBe('Quarterly Town Hall 2026');
    });

    it('should read a single presentation by id', async () => {
      const res = await request(server)
        .get(`/api/presentations/${userAPresentationId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.presentation.id).toBe(userAPresentationId);
      expect(res.body.presentation.title).toBe('Quarterly Town Hall 2026');
    });

    it('should update a presentation title and description', async () => {
      const res = await request(server)
        .put(`/api/presentations/${userAPresentationId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Quarterly Town Hall 2026 - Revised',
          description: 'Updated description for live session',
        });

      expect(res.status).toBe(200);
      expect(res.body.presentation.title).toBe('Quarterly Town Hall 2026 - Revised');
      expect(res.body.presentation.description).toBe('Updated description for live session');
    });
  });

  describe('5. Unauthorized Presentation Access Enforcement', () => {
    beforeAll(async () => {
      // Register User B
      const res = await request(server)
        .post('/api/auth/register')
        .send(testUserB);
      userBToken = res.body.token;
    });

    it('User B should see 0 presentations in their own dashboard', async () => {
      const res = await request(server)
        .get('/api/presentations')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.presentations).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('User B should be forbidden (403) from reading User A presentation', async () => {
      const res = await request(server)
        .get(`/api/presentations/${userAPresentationId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You do not have permission to access this presentation.');
    });

    it('User B should be forbidden (403) from updating User A presentation', async () => {
      const res = await request(server)
        .put(`/api/presentations/${userAPresentationId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Hacked by Bob',
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You do not have permission to update this presentation.');
    });

    it('User B should be forbidden (403) from deleting User A presentation', async () => {
      const res = await request(server)
        .delete(`/api/presentations/${userAPresentationId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'You do not have permission to delete this presentation.');
    });
  });

  describe('6. Presentation Deletion by Owner', () => {
    it('User A should delete their own presentation successfully', async () => {
      const res = await request(server)
        .delete(`/api/presentations/${userAPresentationId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Presentation deleted successfully');

      // Verify it is gone
      const verifyRes = await request(server)
        .get(`/api/presentations/${userAPresentationId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(verifyRes.status).toBe(404);
    });
  });
});
