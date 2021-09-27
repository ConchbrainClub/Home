# apt update && apt upgrade -y

# apt install jq -y

langs=()

pages=$(jq -r .pages[].name articles/config.json)

for page in ${pages[@]};
do
    langs+=($(jq -r .[].language "articles/pages/${page}"))
done

langs=($(awk -v RS=' ' '!a[$1]++' <<< ${langs[@]}))

for lang in ${langs[@]};
do
    echo "-${lang}"
done