import pygame
import os
from constantes import ASSETS_PATH, LASER_SPEED, ENEMY_SPEED


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