import logging as log

log.basicConfig(
    level=log.DEBUG,
    format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    datefmt='%I:%M:%S %p',
    handlers=[
        log.FileHandler('capa_datos.log'),
        log.StreamHandler()
    ]
)

log.debug('Mensaje a nivel debug')
log.info('Mensaje a nivel info')
log.warning('Mensaje a nivel warning')
log.error('Mensaje a nivel error')
log.critical('Mensaje a nivel critical')