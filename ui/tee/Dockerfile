FROM python:3

COPY *.py /opt/tee/

WORKDIR /opt/tee/

RUN \
    pip install quart && \
    chmod -R 0755 *.py

ENV PYTHONUNBUFFERED=1

EXPOSE 5000

USER 1000:1000

CMD [ "python", "./tc_listener.py" ]