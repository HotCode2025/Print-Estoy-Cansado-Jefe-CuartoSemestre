import pygame
import sys
import random
import os
from personaje import Personaje, Enemigo, Explosion
from constantes import (
    SCREEN_WIDTH, SCREEN_HEIGHT, ASSETS_PATH,
    SCROLL_SPEED, PLAYER_SPEED, ENEMY_SPAWN_CHANCE,
    POINTS_PER_KILL, LEVEL_UP_THRESHOLD
)

BACKGROUNDS = [
    'Purple Nebula 1 - 1024x1024.png',
    'Purple Nebula 2 - 1024x1024.png',
    'Purple Nebula 3 - 1024x1024.png',
    'Purple Nebula 4 - 1024x1024.png',
    'Purple Nebula 5 - 1024x1024.png',
    'Purple Nebula 6 - 1024x1024.png',
    'Purple Nebula 7 - 1024x1024.png',
    'Purple Nebula 8 - 1024x1024.png',
]


class ScrollingBackground:
    def __init__(self, surface):
        self.surface = surface
        self.y1 = 0
        self.y2 = -SCREEN_HEIGHT

    def update(self):
        self.y1 += SCROLL_SPEED
        self.y2 += SCROLL_SPEED
        if self.y1 >= SCREEN_HEIGHT:
            self.y1 = -SCREEN_HEIGHT
        if self.y2 >= SCREEN_HEIGHT:
            self.y2 = -SCREEN_HEIGHT

    def draw(self, screen):
        screen.blit(self.surface, (0, self.y1))
        screen.blit(self.surface, (0, self.y2))


def cargar_fondo(nombre):
    ruta = os.path.join(ASSETS_PATH, 'images', 'backgrounds', nombre)
    imagen = pygame.image.load(ruta).convert()
    return pygame.transform.scale(imagen, (SCREEN_WIDTH, SCREEN_HEIGHT))


def mostrar_intro(screen, duracion):
    ruta = os.path.join(ASSETS_PATH, 'images', 'inicio', 'Starfield 1024x1024.png')
    imagen = pygame.image.load(ruta).convert()
    imagen = pygame.transform.scale(imagen, (SCREEN_WIDTH, SCREEN_HEIGHT))
    clock = pygame.time.Clock()
    tiempo_inicial = pygame.time.get_ticks()
    while pygame.time.get_ticks() - tiempo_inicial < duracion:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
        transcurrido = pygame.time.get_ticks() - tiempo_inicial
        alpha = max(0, int(255 - (255 * (transcurrido / duracion))))
        imagen.set_alpha(alpha)
        screen.fill((0, 0, 0))
        screen.blit(imagen, (0, 0))
        pygame.display.flip()
        clock.tick(60)


def mostrar_game_over(screen):
    screen.fill((0, 0, 0))
    font_grande = pygame.font.Font(None, 90)
    font_chica = pygame.font.Font(None, 40)
    texto_go = font_grande.render('GAME OVER', True, (220, 30, 30))
    texto_sub = font_chica.render('Que la Fuerza te acompañe', True, (200, 200, 200))
    screen.blit(texto_go, (SCREEN_WIDTH // 2 - texto_go.get_width() // 2, SCREEN_HEIGHT // 2 - 60))
    screen.blit(texto_sub, (SCREEN_WIDTH // 2 - texto_sub.get_width() // 2, SCREEN_HEIGHT // 2 + 50))
    pygame.display.flip()
    pygame.time.wait(2500)


def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption('Amenaza Fantasma')

    mostrar_intro(screen, 4000)

    sounds_dir = os.path.join(ASSETS_PATH, 'sounds')
    sonido_laser = pygame.mixer.Sound(os.path.join(sounds_dir, 'laserdis.mp3'))
    sonido_explosion = pygame.mixer.Sound(os.path.join(sounds_dir, 'explosion.mp3'))
    pygame.mixer.music.load(os.path.join(sounds_dir, 'efectos.mp3'))
    pygame.mixer.music.play(-1)

    fondo_index = 0
    fondo_surface = cargar_fondo(BACKGROUNDS[fondo_index])
    bg = ScrollingBackground(fondo_surface)

    personaje = Personaje(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 100)
    enemigos = []
    explosiones = []
    puntos = 0
    nivel = 1
    disparo_cooldown = 0

    font = pygame.font.Font(None, 36)
    clock = pygame.time.Clock()
    running = True

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        keys = pygame.key.get_pressed()
        dx, dy = 0, 0
        if keys[pygame.K_LEFT]:
            dx = -PLAYER_SPEED
        if keys[pygame.K_RIGHT]:
            dx = PLAYER_SPEED
        if keys[pygame.K_UP]:
            dy = -PLAYER_SPEED
        if keys[pygame.K_DOWN]:
            dy = PLAYER_SPEED

        personaje.mover(dx, dy)
        personaje.shape.clamp_ip(screen.get_rect())

        disparo_cooldown -= 1
        if keys[pygame.K_SPACE] and disparo_cooldown <= 0:
            personaje.lanzar_laser()
            sonido_laser.play()
            disparo_cooldown = 10

        personaje.lasers = [l for l in personaje.lasers if l.rect.bottom > 0]

        for enemigo in enemigos[:]:
            enemigo.mover()
            if enemigo.rect.top > SCREEN_HEIGHT:
                enemigos.remove(enemigo)
                continue

            for laser in personaje.lasers[:]:
                if enemigo.rect.colliderect(laser.rect):
                    explosiones.append(Explosion(enemigo.rect.centerx, enemigo.rect.centery))
                    enemigos.remove(enemigo)
                    personaje.lasers.remove(laser)
                    sonido_explosion.play()
                    puntos += POINTS_PER_KILL
                    break

            if enemigo in enemigos and enemigo.rect.colliderect(personaje.shape):
                explosiones.append(Explosion(enemigo.rect.centerx, enemigo.rect.centery))
                enemigos.remove(enemigo)
                if not personaje.recibir_dano():
                    running = False

        if random.random() < ENEMY_SPAWN_CHANCE:
            x = random.randint(0, SCREEN_WIDTH - 76)
            enemigos.append(Enemigo(x, -80))

        explosiones = [e for e in explosiones if e.actualizar()]

        if puntos >= LEVEL_UP_THRESHOLD:
            nivel += 1
            puntos = 0
            fondo_index = (fondo_index + 1) % len(BACKGROUNDS)
            fondo_surface = cargar_fondo(BACKGROUNDS[fondo_index])
            bg = ScrollingBackground(fondo_surface)

        bg.update()
        bg.draw(screen)

        personaje.dibujar(screen)
        for enemigo in enemigos:
            enemigo.dibujar(screen)
        for explosion in explosiones:
            explosion.dibujar(screen)

        screen.blit(font.render(f'Puntos: {puntos}', True, (255, 255, 255)), (10, 28))
        screen.blit(font.render(f'Nivel: {nivel}', True, (255, 255, 255)), (10, 58))

        pygame.display.flip()
        clock.tick(60)

    mostrar_game_over(screen)
    pygame.quit()
    sys.exit()


if __name__ == '__main__':
    main()
