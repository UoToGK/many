FROM python:3.9.12

# ENV LANG=C.UTF-8
# ENV LC_ALL=C.UTF-8

RUN ln -fs /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# RUN dpkg-reconfigure -f noninteractive tzdata


WORKDIR /usr/src/app
COPY ./requirements.txt /usr/src/app
RUN pip install --upgrade pip -i https://pypi.douban.com/simple/
RUN pip install -r requirements.txt -i https://pypi.douban.com/simple/



ENV PYTHONPATH=/usr/src/app