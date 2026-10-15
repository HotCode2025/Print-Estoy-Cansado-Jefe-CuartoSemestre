import pygame
import sys
import random
import os
from personaje import Personaje, Enemigo, EnemigoFuerte, Explosion
from constantes import (
    SCREEN_WIDTH, SCREEN_HEIGHT, ASSETS_PATH,
    SCROLL_SPEED, PLAYER_SPEED, ENEMY_SPAWN_CHANCE, STRONG_ENEMY_SPAWN_CHANCE,
    LEVEL_UP_THRESHOLD
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


class BarraVolumen:
    def __init__(self, x, y, width, height, volumen_inicial=0.7):
        self.rect = pygame.Rect(x, y, width, height)
        self.hitbox = self.rect.inflate(16, 16)
        self.volumen = volumen_inicial
        self.arrastrando = False

    def manejar_evento(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.hitbox.collidepoint(event.pos):
                self.arrastrando = True
                self.actualizar_volumen(event.pos[0])
                return True
        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            self.arrastrando = False
        elif event.type == pygame.MOUSEMOTION and self.arrastrando:
            self.actualizar_volumen(event.pos[0])
            return True
        elif event.type == pygame.MOUSEWHEEL and self.hitbox.collidepoint(pygame.mouse.get_pos()):
            self.volumen = max(0.0, min(1.0, self.volumen + event.y * 0.05))
            return True
        elif event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_PLUS, pygame.K_KP_PLUS, pygame.K_EQUALS):
                self.volumen = min(1.0, self.volumen + 0.05)
                return True
            elif event.key in (pygame.K_MINUS, pygame.K_KP_MINUS):
                self.volumen = max(0.0, self.volumen - 0.05)
                return True
        return False

    def actualizar_volumen(self, mouse_x):
        rel_x = mouse_x - self.rect.x
        self.volumen = max(0.0, min(1.0, rel_x / self.rect.width))

    def aplicar_volumen(self, sonidos):
        pygame.mixer.music.set_volume(self.volumen)
        for sonido in sonidos:
            sonido.set_volume(self.volumen)

    def dibujar(self, screen, font):
        texto = font.render(f'Vol: {int(self.volumen * 100)}%', True, (220, 220, 220))
        screen.blit(texto, (self.rect.x - texto.get_width() - 10, self.rect.y - 2))

        pygame.draw.rect(screen, (35, 35, 50), self.rect, border_radius=4)
        ancho_actual = int(self.rect.width * self.volumen)
        if ancho_actual > 0:
            rect_activo = pygame.Rect(self.rect.x, self.rect.y, ancho_actual, self.rect.height)
            pygame.draw.rect(screen, (70, 160, 240), rect_activo, border_radius=4)
        pygame.draw.rect(screen, (160, 160, 190), self.rect, 1, border_radius=4)

        knob_x = self.rect.x + ancho_actual
        knob_rect = pygame.Rect(knob_x - 5, self.rect.y - 4, 10, self.rect.height + 8)
        pygame.draw.rect(screen, (245, 245, 255), knob_rect, border_radius=3)
        pygame.draw.rect(screen, (100, 100, 130), knob_rect, 1, border_radius=3)


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

    barra_volumen = BarraVolumen(SCREEN_WIDTH - 150, 20, 130, 14, 0.7)
    barra_volumen.aplicar_volumen([sonido_laser, sonido_explosion])

    fondo_index = 0
    fondo_surface = cargar_fondo(BACKGROUNDS[fondo_index])
    bg = ScrollingBackground(fondo_surface)

    personaje = Personaje(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 100)
    enemigos = []
    balas_enemigas = []
    explosiones = []
    puntos = 0
    nivel = 1
    disparo_cooldown = 0
    
    estado_transicion = False
    alpha_transicion = 0
    
    fade_surface = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
    fade_surface.fill((255, 255, 255))

    font = pygame.font.Font(None, 36)
    font_volumen = pygame.font.Font(None, 26)
    clock = pygame.time.Clock()
    running = True

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if barra_volumen.manejar_evento(event):
                barra_volumen.aplicar_volumen([sonido_laser, sonido_explosion])


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
        personaje.update_hitbox()

        disparo_cooldown -= 1
        if keys[pygame.K_SPACE] and disparo_cooldown <= 0:
            personaje.lanzar_laser()
            sonido_laser.play()
            disparo_cooldown = 10

        personaje.lasers = [l for l in personaje.lasers if l.rect.bottom > 0]

        for enemigo in enemigos[:]:
            if enemigo.rect.top > SCREEN_HEIGHT:
                enemigos.remove(enemigo)
                continue

            laser_impacto = False
            for laser in personaje.lasers[:]:
                if enemigo.rect.colliderect(laser.rect):
                    personaje.lasers.remove(laser)
                    laser_impacto = True
                    break

            if laser_impacto:
                if enemigo.recibir_dano():
                    explosiones.append(Explosion(enemigo.rect.centerx, enemigo.rect.centery))
                    enemigos.remove(enemigo)
                    sonido_explosion.play()
                    puntos += enemigo.puntos
                    continue

            if enemigo.rect.colliderect(personaje.hitbox):
                explosiones.append(Explosion(enemigo.rect.centerx, enemigo.rect.centery))
                enemigos.remove(enemigo)
                sonido_explosion.play()
                if not personaje.recibir_dano():
                    running = False
                continue

            nuevas_balas = enemigo.update(personaje.shape.centerx, personaje.shape.centery)
            if nuevas_balas:
                balas_enemigas.extend(nuevas_balas)

                    
        for bala in balas_enemigas[:]:
            bala.mover()
            if bala.rect.top > SCREEN_HEIGHT or bala.rect.bottom < 0 or bala.rect.left > SCREEN_WIDTH or bala.rect.right < 0:
                balas_enemigas.remove(bala)
                continue
            if bala.rect.colliderect(personaje.hitbox):
                balas_enemigas.remove(bala)
                explosiones.append(Explosion(personaje.shape.centerx, personaje.shape.top))
                if not personaje.recibir_dano():
                    running = False

        if random.random() < ENEMY_SPAWN_CHANCE:
            x = random.randint(0, SCREEN_WIDTH - 76)
            enemigos.append(Enemigo(x, -80))
            
        if random.random() < STRONG_ENEMY_SPAWN_CHANCE:
            x = random.randint(0, SCREEN_WIDTH - 91)
            enemigos.append(EnemigoFuerte(x, -100))

        explosiones = [e for e in explosiones if e.actualizar()]

        if puntos >= LEVEL_UP_THRESHOLD and not estado_transicion:
            nivel += 1
            puntos = 0
            estado_transicion = True
            alpha_transicion = 0
            
        bg.update()
        bg.draw(screen)

        if estado_transicion:
            alpha_transicion += 5
            if alpha_transicion >= 255:
                fondo_index = (fondo_index + 1) % len(BACKGROUNDS)
                fondo_surface = cargar_fondo(BACKGROUNDS[fondo_index])
                bg = ScrollingBackground(fondo_surface)
                estado_transicion = False
            else:
                fade_surface.set_alpha(alpha_transicion)
                screen.blit(fade_surface, (0, 0))
        else:
            if alpha_transicion > 0:
                alpha_transicion -= 5
                fade_surface.set_alpha(alpha_transicion)
                screen.blit(fade_surface, (0, 0))

        personaje.dibujar(screen)
        
        for enemigo in enemigos:
            enemigo.dibujar(screen)
        for bala in balas_enemigas:
            bala.dibujar(screen)
        for explosion in explosiones:
            explosion.dibujar(screen)

        screen.blit(font.render(f'Puntos: {puntos}', True, (255, 255, 255)), (10, 28))
        screen.blit(font.render(f'Nivel: {nivel}', True, (255, 255, 255)), (10, 58))
        barra_volumen.dibujar(screen, font_volumen)

        pygame.display.flip()
        clock.tick(60)

    mostrar_game_over(screen)
    pygame.quit()
    sys.exit()


if __name__ == '__main__':
    main()
