const styles = (theme) => ({
    categories: {
        paddingBottom: '40px',
        '& .MuiTypography-h4': {
            textTransform: 'uppercase',
            fontSize: '14px',
            fontWeight: '600',
            lineHeight: '18px',
            letterSpacing: '1px',
        },
        '& .MuiButton-root': {
            height: '110px',
            borderRadius: '15px',
            backgroundBlendMode: 'soft-light, normal',
            '&:hover': {
                '& .MuiTypography-root': {
                    opacity: 1,
                    transition: 'opacity 0.2s ease-in-out',
                },
            },
        },
        '& .MuiButton-root.Mui-disabled': {
            color: '#ffffff',
            '& .MuiTypography-root': {
                opacity: 1,
            }
        },
    },
    text: {
        color: '#fff',
        fontSize: '18px',
        fontWeight: '600',
        height: '24px',
        textAlign: 'center',
        textTransform: 'capitalize',
        opacity: 0.7,
        transition: 'opacity 0.2s ease-in-out',
    },
    selected: {
        border: 'solid 3px #3F466D',
        backgroundColor: '#272B4A',
        '& .MuiSvgIcon-root': {
            fontSize: '80px',
            position: 'absolute',
            bottom: -45,
            color: '#272B4A',
        }
    },
    all: {
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
        backgroundColor: '#505679',
        '&:hover': {
            backgroundColor: '#6f76a0',
        },
    },
    stable: {
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
        backgroundColor: '#4771D1',
        '&:hover': {
            backgroundColor: '#628be8',
        },
    },
    top: {
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
        backgroundColor: '#073FAB',
        '&:hover': {
            backgroundColor: '#1054d4',
        },
    },
    recent: {
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
        backgroundColor: '#9D57F7',
        '&:hover': {
            backgroundColor: '#b576ff',
        },
    },
    low: {
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
        backgroundColor: '#2E90A5',
        '&:hover': {
            backgroundColor: '#3eabc2',
        },
    },
    listFilter: {
        marginBottom: '12px',
        '& .MuiTextField-root .MuiInputBase-input': {
            width: 150,
            [theme.breakpoints.up('sm')]: {
                width: 375,
            },
        },
        '& .MuiOutlinedInput-notchedOutline': {
            fontSize: '18px',
            fontWeight: '600',
            borderColor: theme.palette.type === 'dark' ? '#484F7F' : '#ff0000',
            borderWidth: '2px',
            borderRadius: '30px',
        }
    },
    input: {
        fontSize: '18px',
        fontWeight: '600',
        borderWidth: '2px',
        borderRadius: '30px',
        width: 150,
        [theme.breakpoints.up('sm')]: {
            width: 375,
        },
    },
    filters: {
        borderColor: theme.palette.type === 'dark' ? '#484F7F' : '#ff0000',
        borderWidth: '2px',
        borderRadius: '30px',
        borderStyle: 'solid',
        backgroundColor: '#14182B'
    }
});

export default styles;
