cd $HOME/workspace/WSF
tizen build-web
cd .buildResult
rm -r .git
tizen package -t wgt -s bkdmobile_tv_2
tizen install -s 192.168.1.32:26101 -n WSF.wgt
OUTPUT=$(sdb -s 192.168.1.32:26101 shell 0 debug fgadnv6P3J.WSF)
LEN=${#OUTPUT}
PORT=${OUTPUT:${LEN} - 6:5}
sdb -s 192.168.1.32 forward tcp:26101 tcp:${PORT}