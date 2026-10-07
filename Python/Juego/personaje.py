import pygame
import os
from constantes import ASSETS_PATH, LASER_SPEED, ENEMY_SPEED


class Personaje:
    PLAYER_SIZE = (90, 76)

    def __init__(self, x, y):
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'Player 119x100.png')).convert_alpha()
        self.image = pygame.transform.scale(raw, self.PLAYER_SIZE)
        self.shape = self.image.get_rect(center=(x, y))
        self.lasers = []
        self.energia = 100

    def mover(self, dx, dy):
        self.shape.x += dx
        self.shape.y += dy

    def lanzar_laser(self):
        self.lasers.append(Laser(self.shape.centerx, self.shape.top))

    def recibir_dano(self):
        self.energia -= 10
        if self.energia <= 0:
            self.energia = 0
            return False
        return True

    def dibujar(self, screen):
        screen.blit(self.image, self.shape.topleft)
        for laser in self.lasers:
            laser.dibujar(screen)
            laser.mover()

        barra_fondo = pygame.Rect(10, 10, 100, 10)
        barra_vida = pygame.Rect(10, 10, self.energia, 10)
        pygame.draw.rect(screen, (180, 30, 30), barra_fondo)
        pygame.draw.rect(screen, (50, 220, 80), barra_vida)


class Enemigo:
    ENEMY_SIZE = (76, 64)

    def __init__(self, x, y):
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'Enemy 119x100.png')).convert_alpha()
        self.image = pygame.transform.scale(raw, self.ENEMY_SIZE)
        self.rect = self.image.get_rect(topleft=(x, y))

    def mover(self):
        self.rect.y += ENEMY_SPEED

    def dibujar(self, screen):
        screen.blit(self.image, self.rect.topleft)


class Laser:
    LASER_SIZE = (16, 16)

    def __init__(self, x, y):
        raw = pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'bullets', 'Player-Bullet.png')).convert_alpha()
        self.image = pygame.transform.scale(raw, self.LASER_SIZE)
        self.rect = self.image.get_rect(center=(x, y))

    def mover(self):
        self.rect.y -= LASER_SPEED

    def dibujar(self, screen):
        screen.blit(self.image, self.rect.topleft)


class Explosion:
    FRAME_COUNT = 9
    FRAMES_PER_IMAGE = 4
    EXPLOSION_SIZE = (96, 96)

    def __init__(self, x, y):
        self.images = [
            pygame.transform.scale(
                pygame.image.load(os.path.join(ASSETS_PATH, 'images', 'explosion', f'{i}.png')).convert_alpha(),
                self.EXPLOSION_SIZE
            )
            for i in range(1, self.FRAME_COUNT + 1)
        ]
        self.index = 0
        self.image = self.images[self.index]
        self.rect = self.image.get_rect(center=(x, y))
        self.frame_timer = 0

    def actualizar(self):
        self.frame_timer += 1
        if self.frame_timer >= self.FRAMES_PER_IMAGE:
            self.frame_timer = 0
            self.index += 1
            if self.index >= len(self.images):
                return False
            self.image = self.images[self.index]
        return True

    def dibujar(self, screen):
        screen.blit(self.image, self.rect.topleft)