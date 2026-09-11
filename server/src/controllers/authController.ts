import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/prisma.js';
import { ENV } from '../config/env.js';
import { RegisterInput, LoginInput } from '../validation/auth.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, ENV.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export async function register(req: Request<{}, {}, RegisterInput>, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    // Secure password hashing with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Set HttpOnly cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      message: 'Registration successful',
      user,
      token,
    });
  } catch (error) {
    console.error('[Auth Error - Register]:', error);
    res.status(500).json({ error: 'Failed to complete registration due to an internal error.' });
  }
}

export async function login(req: Request<{}, {}, LoginInput>, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Compare passwords securely
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Set HttpOnly cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('[Auth Error - Login]:', error);
    res.status(500).json({ error: 'Failed to log in due to an internal error.' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: ENV.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Logged out successfully.' });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  const presentationCount = await prisma.presentation.count({
    where: { ownerId: req.user.id },
  });

  res.status(200).json({
    user: req.user,
    totalPresentations: presentationCount,
  });
}
