const styles = theme => ({
    item: props => ({
        marginTop: '6px',
        display: 'flex',
        alignItems: 'center',
        padding: 0, 
        width: '100%',
        background: props.muted ? 'rgba(48, 53, 92, 0.4)' : '#272B4A',
        '&:hover': {
            background: props.muted ? 'rgba(48, 53, 92, 0.4)' : '#272B4A',
        },
        border: props.muted ? "4px solid rgba(72, 79, 127, 0.4)" : "4px solid #484F7F",
        [theme.breakpoints.up('md')]: {
            marginTop: '8px',
        },
    }),
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
        lineHeight: '14px',
        color: '#8585A6',
        letterSpacing: '0.2px',
        textTransform: 'capitalize',
        [theme.breakpoints.up('lg')]: {
            lineHeight: '24px',
        },
    },
    rWidth: {
        minWidth: '80px',
        padding: '20px 10px',
        [theme.breakpoints.up('sm')]: {
            minWidth: '100px',
            padding: '20px 10px',
        },
        [theme.breakpoints.up('md')]: {
            minWidth: '140px',
            padding: '20px 15px',
        },
        [theme.breakpoints.up('lg')]: {
            minWidth: '170px',
            padding: '20px 20px',
        },
    },
    apyContainer: props => ({
        display: "flex",
        flexDirection: 'column',
        alignItems: "center",
        textAlign: 'center',
        backgroundColor: props.muted ? 'transparent' : "#3E4570",
        padding: '15px 10px',
        minWidth: '150px',
        borderTopRightRadius: '15px',
        borderBottomRightRadius: '15px',
        '& .MuiTypography-h1': {
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '34px',
            color: props.muted ? '#424866' : "white",
            [theme.breakpoints.up('sm')]: {
                fontSize: '22px',
            },
            [theme.breakpoints.up('md')]: {
                fontSize: '30px',
            },
        },
        '& .MuiTypography-h2': {
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '24px',
            color: '#8585A6',
            [theme.breakpoints.up('sm')]: {
                fontSize: '16px',
            },
            [theme.breakpoints.up('md')]: {
                fontSize: '18px',
            },
        },
        [theme.breakpoints.up('sm')]: {
            minWidth: '170px',
            padding: '15px 12px',
        },
        [theme.breakpoints.up('md')]: {
            minWidth: '225px',
            padding: '15px 15px',
        },
        [theme.breakpoints.up('lg')]: {
            minWidth: '250px',
        },
    }),
    cta: {
        border: 'solid 2px #54995C',
        backgroundColor: '#54995C',
        borderRadius: '30px',
        color: '#ffffff',
        fontWeight: 700,
        textTransform: 'capitalize',
        marginTop: '10px',
        display: 'block',
        padding: '4px',
        fontSize: '15px',
        '&:hover': {
            backgroundColor: '#54995C',
        },
        [theme.breakpoints.up('sm')]: {
            padding: '4px 6px',
            fontSize: '14px',
        },
        [theme.breakpoints.up('md')]: {
            padding: '4px 14px',
            fontSize: '18px',
        },
        [theme.breakpoints.up('lg')]: {
            padding: '4px 17px',
        },
    },
    moreInfoIcon: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    title: {
        marginLeft: '20px',
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
    },
    chart: {
        padding: 0
    }
});

export default styles;
