-- we don't know how to generate root <with-no-name> (class Root) :(

create table artist
(
    artist_id  bigint auto_increment
        primary key,
    debut_date date         not null,
    img_url    text         null,
    name_en    varchar(100) not null,
    name_kr    varchar(100) not null
)
    charset = utf8mb4;

create table banner
(
    id            bigint auto_increment
        primary key,
    active        bit          not null,
    artist_id     bigint       null,
    display_order int          null,
    image_url     varchar(255) null
);

create table tag
(
    tag_id   bigint auto_increment
        primary key,
    tag_name varchar(100) not null,
    constraint uk_tag_name
        unique (tag_name)
);

create index idx_tag_name
    on tag (tag_name);

create table tag_search_log
(
    id          bigint auto_increment
        primary key,
    tag_id      bigint                                   not null,
    searched_at datetime(6) default CURRENT_TIMESTAMP(6) not null,
    keyword_raw varchar(255)                             null,
    constraint fk_tag_search_log_tag
        foreign key (tag_id) references tag (tag_id)
);

create index idx_tag_search_log_searched_at
    on tag_search_log (searched_at);

create index idx_tag_search_log_tag
    on tag_search_log (tag_id);

create index idx_tag_search_log_tag_searched_at
    on tag_search_log (tag_id, searched_at);

create table user
(
    id                   bigint auto_increment
        primary key,
    created_at           datetime(6)                                null,
    deleted              bit                                        not null,
    deleted_at           datetime(6)                                null,
    email                varchar(255)                               not null,
    has_local_credential bit                                        null,
    img_url              text                                       null,
    language             varchar(2)                                 not null,
    nickname             varchar(100)                               not null,
    password             varchar(255)                               not null,
    provider             enum ('GOOGLE', 'KAKAO', 'LOCAL', 'NAVER') null,
    provider_id          varchar(255)                               null,
    role                 enum ('ADMIN', 'USER')                     not null,
    user_id              varchar(50)                                not null,
    constraint uk_user_email
        unique (email),
    constraint uk_user_provider_pid
        unique (provider, provider_id),
    constraint uk_user_user_id
        unique (user_id)
)
    charset = utf8mb4;

create table artist_follow
(
    artist_id  bigint      not null,
    user_id    bigint      not null,
    created_at datetime(6) not null,
    primary key (artist_id, user_id),
    constraint FK62mpyj1xkf107gy8wt2lu9w4l
        foreign key (user_id) references user (id),
    constraint FKnpwfyaffcsiq7rqijceh0ow7s
        foreign key (artist_id) references artist (artist_id)
)
    charset = utf8mb4;

create table follow
(
    follower_id  bigint      not null,
    following_id bigint      not null,
    created_at   datetime(6) not null,
    primary key (follower_id, following_id),
    constraint FKmow2qk674plvwyb4wqln37svv
        foreign key (follower_id) references user (id),
    constraint FKqme6uru2g9wx9iysttk542esm
        foreign key (following_id) references user (id)
)
    charset = utf8mb4;

create table meme
(
    meme_id      bigint auto_increment
        primary key,
    created_at   datetime(6)  not null,
    download_cnt int          not null,
    image_url    varchar(255) not null,
    usage_cnt    int          not null,
    creator_id   bigint       not null,
    constraint fk_meme_creator_user
        foreign key (creator_id) references user (id)
);

create index idx_meme_creator_id
    on meme (creator_id);

create table meme_favorite
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6) not null,
    meme_id    bigint      not null,
    user_id    bigint      not null,
    constraint uk_mf_user_meme
        unique (user_id, meme_id),
    constraint fk_mf_meme
        foreign key (meme_id) references meme (meme_id),
    constraint fk_mf_user
        foreign key (user_id) references user (id)
);

create index idx_mf_meme
    on meme_favorite (meme_id);

create index idx_mf_user
    on meme_favorite (user_id asc, created_at desc);

create table meme_hourly_top10
(
    id             bigint auto_increment
        primary key,
    hour_start     datetime(6) not null,
    rank_no        int         not null,
    meme_id        bigint      not null,
    use_count      int         not null,
    download_count int         not null,
    total_count    int         not null,
    updated_at     datetime(6) not null,
    constraint uk_meme_hourly_top10
        unique (hour_start, rank_no),
    constraint fk_meme_hourly_top10_meme
        foreign key (meme_id) references meme (meme_id)
);

create index idx_meme_hourly_top10_hour
    on meme_hourly_top10 (hour_start);

create table meme_tag
(
    meme_id bigint not null,
    tag_id  bigint not null,
    primary key (meme_id, tag_id),
    constraint fk_meme_tag_meme
        foreign key (meme_id) references meme (meme_id),
    constraint fk_meme_tag_tag
        foreign key (tag_id) references tag (tag_id)
);

create index idx_meme_tag_meme
    on meme_tag (meme_id);

create index idx_meme_tag_tag
    on meme_tag (tag_id);

create table meme_usage_log
(
    meme_usage_id bigint auto_increment
        primary key,
    created_at    datetime(6)              not null,
    usage_type    enum ('DOWNLOAD', 'USE') not null,
    meme_id       bigint                   not null,
    user_id       bigint                   not null,
    constraint fk_meme_usage_log_meme
        foreign key (meme_id) references meme (meme_id),
    constraint fk_meme_usage_log_user
        foreign key (user_id) references user (id)
);

create index idx_meme_usage_log_created_at
    on meme_usage_log (created_at);

create index idx_meme_usage_log_meme
    on meme_usage_log (meme_id);

create index idx_meme_usage_log_user
    on meme_usage_log (user_id);

create table penalty
(
    penalty_id   bigint auto_increment
        primary key,
    end_at       datetime(6)                                                  null,
    penalty_type enum ('ACCOUNT_SUSPENSION', 'CHAT_BAN', 'ROOM_CREATION_BAN') not null,
    reason       varchar(255)                                                 not null,
    start_at     datetime(6)                                                  null,
    status       enum ('ACTIVE', 'EXPIRED', 'RELEASED')                       not null,
    user_id      bigint                                                       not null,
    constraint FKnldcdm2661qwmocy5g4ejc5mo
        foreign key (user_id) references user (id)
)
    charset = utf8mb4;

create table report
(
    report_id        bigint auto_increment
        primary key,
    report_reason    varchar(255)                             null,
    report_status    enum ('APPROVED', 'PENDING', 'REJECTED') not null,
    report_type      enum ('MESSAGE', 'ROOM')                 not null,
    reported_at      datetime(6)                              not null,
    reported_content varchar(255)                             null,
    reported_user_id bigint                                   not null,
    reporter_user_id bigint                                   not null,
    constraint FKgv5el6pnw9fbo9shq49ww3m4e
        foreign key (reported_user_id) references user (id),
    constraint FKn64sd5p2ql3abexm8ht1vhi80
        foreign key (reporter_user_id) references user (id)
)
    charset = utf8mb4;

create table room
(
    room_id    bigint auto_increment
        primary key,
    created_at datetime(6)  null,
    img_url    text         null,
    title      varchar(100) not null,
    artist_id  bigint       not null,
    creator_id bigint       not null,
    constraint FKisdkhsvbo7y96l64ehryi59ss
        foreign key (creator_id) references user (id),
    constraint FKkx8kghicx0bnso3uobylbhmqq
        foreign key (artist_id) references artist (artist_id)
)
    charset = utf8mb4;

create index idx_room_creator_id
    on room (creator_id);

create table user_block
(
    blocked_id bigint      not null,
    blocker_id bigint      not null,
    created_at datetime(6) not null,
    primary key (blocked_id, blocker_id),
    constraint FKccncjsehavren2hx4gmenhwim
        foreign key (blocked_id) references user (id),
    constraint FKla30ofkpxixhf1cmi2a2veban
        foreign key (blocker_id) references user (id)
)
    charset = utf8mb4;

create table user_engagement_stats
(
    user_id           bigint                                   not null
        primary key,
    room_create_count int         default 0                    not null,
    artist_chat_count int         default 0                    not null,
    meme_create_count int         default 0                    not null,
    p_room            decimal(5, 2)                            null,
    p_chat            decimal(5, 2)                            null,
    p_meme            decimal(5, 2)                            null,
    p_composite       decimal(5, 2)                            null,
    grade_room        varchar(10)                              null,
    grade_chat        varchar(10)                              null,
    grade_meme        varchar(10)                              null,
    grade_composite   varchar(10)                              null,
    updated_at        datetime(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6),
    constraint fk_ues_user
        foreign key (user_id) references user (id)
)
    charset = utf8mb4;

create index idx_ues_counts
    on user_engagement_stats (room_create_count, artist_chat_count, meme_create_count);

create index idx_ues_grade_comp
    on user_engagement_stats (grade_composite, p_composite);

