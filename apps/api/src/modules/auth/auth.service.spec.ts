import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUser = {
  id: 'test-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  plan: 'FREE',
  passwordHash: null as string | null,
  isActive: true,
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: { deleteMany: jest.fn() },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockConfig = {
  getOrThrow: jest.fn().mockReturnValue('mock-secret'),
  get: jest.fn().mockReturnValue('15m'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      await expect(service.register({ email: 'test@example.com', password: 'Pass@123', name: 'Test' }))
        .rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, passwordHash: 'hashed' });
      const result = await service.register({ email: 'new@example.com', password: 'Pass@123!', name: 'New' });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('validateUser', () => {
    it('should return null for wrong password', async () => {
      const hash = await bcrypt.hash('CorrectPass@1', 12);
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: hash });
      const result = await service.validateUser('test@example.com', 'WrongPass@1');
      expect(result).toBeNull();
    });

    it('should return user for correct credentials', async () => {
      const hash = await bcrypt.hash('CorrectPass@1', 12);
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: hash });
      const result = await service.validateUser('test@example.com', 'CorrectPass@1');
      expect(result).toBeDefined();
      expect(result!.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.validateUser('noexist@example.com', 'any');
      expect(result).toBeNull();
    });
  });
});
