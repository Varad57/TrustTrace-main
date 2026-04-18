FROM python:3.9-slim
WORKDIR /app
RUN pip install flask requests tenseal numpy
COPY app.py .
COPY simulate_client.py .
CMD ["python", "app.py"]
