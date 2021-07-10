const styles = (theme) => ({
    item: {
        margin: '8px 0 0 0',
        display: 'flex',
        alignItems: 'center',
        padding: 0,
        width: '100%',
        background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
        '&:hover': {
            background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
        },
        border: "4px solid #484F7F",
    },
    apyBg: {
        background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
    },
    roundedLeft: {
        borderTopLeftRadius: '20px',
        borderBottomLeftRadius: '20px',
    },
    roundedRight: {
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
    },
    h2: {
        fontWeight: 600,
        fontSize: '12px',
        lineHeight: '36px',
        margin: 0,
        padding: 0,
        [theme.breakpoints.up('sm')]: {
            fontSize: '16px',
        },
        [theme.breakpoints.up('lg')]: {
            fontSize: '27px',
        },
    },
    h3: {
        fontWeight: 400,
        fontSize: '15px',
        lineHeight: '24px',
        color: '#8585A6',
        letterSpacing: '0.2px',
        textTransform: 'capitalize',
    },
    rWidth: {
        minWidth: '80px',
        padding: '20px',
        [theme.breakpoints.up('sm')]: {
            minWidth: '100px',
        },
        [theme.breakpoints.up('md')]: {
            minWidth: '140px',
        },
        [theme.breakpoints.up('lg')]: {
            minWidth: '170px',
        },
    },
    apyContainer: {
        textAlign: 'center',
        backgroundColor: "#3E4570",
        padding: '15px 25px',
        borderTopRightRadius: '15px',
        borderBottomRightRadius: '15px',
        '& .MuiTypography-h1': {
            fontWeight: 600,
            fontSize: '30px',
            lineHeight: '34px',
        },
        '& .MuiTypography-h2': {
            fontWeight: 600,
            fontSize: '18px',
            lineHeight: '24px',
            color: '#8585A6'
        },
    },
    cta: {
        border: 'solid 2px #54995C',
        backgroundColor: '#54995C',
        borderRadius: '30px',
        marginLeft: '10px',
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: 700,
        padding: '4px 19px',
        textTransform: 'capitalize',
        marginTop: '10px',
        display: 'block',
        '&:hover': {
            backgroundColor: '#54995C',
        }
    },
    moreInfoIcon: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    infoContainer: {
        '& .MuiAvatar-root': {
            marginLeft: '20px',
        },
    },
    title: {
        marginLeft: '20px',
        textTransform: 'capitalize',
        '& .MuiTypography-root': {
            '& img': {
                marginRight: '3px',
                marginTop: '2px',
                float: 'left',
            }
        },
    },
    bold: {
        color: "white"
    }
});

export default styles;
